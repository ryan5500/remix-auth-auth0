import {} from "@mjackson/headers";
import { Auth0, OAuth2RequestError, UnexpectedErrorResponseBodyError, UnexpectedResponseError, generateCodeVerifier, generateState, } from "arctic";
import createDebug from "debug";
import { Strategy } from "remix-auth/strategy";
import { redirect } from "./lib/redirect.js";
import { StateStore } from "./lib/store.js";
const debug = createDebug("Auth0Strategy");
export { OAuth2RequestError, UnexpectedErrorResponseBodyError, UnexpectedResponseError, };
export class Auth0Strategy extends Strategy {
    options;
    name = "auth0";
    client;
    constructor(options, verify) {
        super(verify);
        this.options = options;
        this.client = new Auth0(options.domain, options.clientId, options.clientSecret, options.redirectURI.toString());
    }
    get cookieName() {
        if (typeof this.options.cookie === "string") {
            return this.options.cookie || "auth0";
        }
        return this.options.cookie?.name ?? "auth0";
    }
    get cookieOptions() {
        if (typeof this.options.cookie !== "object")
            return {};
        return this.options.cookie ?? {};
    }
    async authenticate(request) {
        debug("Request URL", request.url);
        let url = new URL(request.url);
        let stateUrl = url.searchParams.get("state");
        if (!stateUrl) {
            debug("No state found in the URL, redirecting to authorization endpoint");
            let { state, codeVerifier, url } = this.createAuthorizationURL();
            debug("State", state);
            debug("Code verifier", codeVerifier);
            url.search = this.authorizationParams(url.searchParams, request).toString();
            debug("Authorization URL", url.toString());
            let store = StateStore.fromRequest(request, this.cookieName);
            store.set(state, codeVerifier);
            throw redirect(url.toString(), {
                headers: {
                    "Set-Cookie": store
                        .toSetCookie(this.cookieName, this.cookieOptions)
                        .toString(),
                },
            });
        }
        let store = StateStore.fromRequest(request, this.cookieName);
        if (!store.has()) {
            throw new ReferenceError("Missing state on cookie.");
        }
        if (!store.has(stateUrl)) {
            throw new RangeError("State in URL doesn't match state in cookie.");
        }
        let error = url.searchParams.get("error");
        if (error) {
            let description = url.searchParams.get("error_description");
            let uri = url.searchParams.get("error_uri");
            throw new OAuth2RequestError(error, description, uri, stateUrl);
        }
        let code = url.searchParams.get("code");
        if (!code)
            throw new ReferenceError("Missing code in the URL");
        let codeVerifier = store.get(stateUrl);
        if (!codeVerifier) {
            throw new ReferenceError("Missing code verifier on cookie.");
        }
        debug("Validating authorization code");
        let tokens = await this.validateAuthorizationCode(code, codeVerifier);
        debug("Verifying the user profile");
        let user = await this.verify({ request, tokens });
        debug("User authenticated");
        return user;
    }
    createAuthorizationURL() {
        let state = generateState();
        let codeVerifier = generateCodeVerifier();
        let url = this.client.createAuthorizationURL(state, codeVerifier, this.options.scopes ?? []);
        return { state, codeVerifier, url };
    }
    validateAuthorizationCode(code, codeVerifier) {
        return this.client.validateAuthorizationCode(code, codeVerifier);
    }
    /**
     * Return extra parameters to be included in the authorization request.
     *
     * Some OAuth 2.0 providers allow additional, non-standard parameters to be
     * included when requesting authorization.  Since these parameters are not
     * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
     * strategies can override this function in order to populate these
     * parameters as required by the provider.
     */
    authorizationParams(params, request) {
        return new URLSearchParams(params);
    }
    /**
     * Get a new OAuth2 Tokens object using the refresh token once the previous
     * access token has expired.
     * @param refreshToken The refresh token to use to get a new access token
     * @returns The new OAuth2 tokens object
     * @example
     * ```ts
     * let tokens = await strategy.refreshToken(refreshToken);
     * console.log(tokens.accessToken());
     * ```
     */
    refreshToken(refreshToken) {
        return this.client.refreshAccessToken(refreshToken);
    }
    /**
     * Users the token revocation endpoint of the identity provider to revoke the
     * access token and make it invalid.
     *
     * @param token The access token to revoke
     * @example
     * ```ts
     * // Get it from where you stored it
     * let accessToken = await getAccessToken();
     * await strategy.revokeToken(tokens.access_token);
     * ```
     */
    revokeToken(token) {
        return this.client.revokeToken(token);
    }
}
//# sourceMappingURL=index.js.map