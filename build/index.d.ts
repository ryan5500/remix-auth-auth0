import { type SetCookieInit } from "@mjackson/headers";
import { Auth0, OAuth2RequestError, type OAuth2Tokens, UnexpectedErrorResponseBodyError, UnexpectedResponseError } from "arctic";
import { Strategy } from "remix-auth/strategy";
type URLConstructor = ConstructorParameters<typeof URL>[0];
export { OAuth2RequestError, UnexpectedErrorResponseBodyError, UnexpectedResponseError, };
export declare class Auth0Strategy<User> extends Strategy<User, Auth0Strategy.VerifyOptions> {
    protected options: Auth0Strategy.ConstructorOptions;
    name: string;
    protected client: Auth0;
    constructor(options: Auth0Strategy.ConstructorOptions, verify: Strategy.VerifyFunction<User, Auth0Strategy.VerifyOptions>);
    private get cookieName();
    private get cookieOptions();
    authenticate(request: Request): Promise<User>;
    protected createAuthorizationURL(): {
        state: string;
        codeVerifier: string;
        url: URL;
    };
    protected validateAuthorizationCode(code: string, codeVerifier: string): Promise<OAuth2Tokens>;
    /**
     * Return extra parameters to be included in the authorization request.
     *
     * Some OAuth 2.0 providers allow additional, non-standard parameters to be
     * included when requesting authorization.  Since these parameters are not
     * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
     * strategies can override this function in order to populate these
     * parameters as required by the provider.
     */
    protected authorizationParams(params: URLSearchParams, request: Request): URLSearchParams;
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
    refreshToken(refreshToken: string): Promise<OAuth2Tokens>;
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
    revokeToken(token: string): Promise<void>;
}
export declare namespace Auth0Strategy {
    interface VerifyOptions {
        /** The request that triggered the verification flow */
        request: Request;
        /** The OAuth2 tokens retrivied from the identity provider */
        tokens: OAuth2Tokens;
    }
    interface ConstructorOptions {
        /**
         * The name of the cookie used to keep state and code verifier around.
         *
         * The OAuth2 flow requires generating a random state and code verifier, and
         * then checking that the state matches when the user is redirected back to
         * the application. This is done to prevent CSRF attacks.
         *
         * The state and code verifier are stored in a cookie, and this option
         * allows you to customize the name of that cookie if needed.
         * @default "auth0"
         */
        cookie?: string | (Omit<SetCookieInit, "value"> & {
            name: string;
        });
        /**
         * The domain of the Identity Provider you're using to authenticate users.
         */
        domain: string;
        /**
         * This is the Client ID of your application, provided to you by the Identity
         * Provider you're using to authenticate users.
         */
        clientId: string;
        /**
         * This is the Client Secret of your application, provided to you by the
         * Identity Provider you're using to authenticate users.
         */
        clientSecret: string;
        /**
         * The URL of your application where the Identity Provider will redirect the
         * user after they've logged in or authorized your application.
         */
        audience?: string;
        /**
         * The URL of your application where the Identity Provider will redirect the
         * user after they've logged in or authorized your application.
         */
        redirectURI: URLConstructor;
        /**
         * The scopes you want to request from the Identity Provider, this is a list
         * of strings that represent the permissions you want to request from the
         * user.
         */
        scopes?: Scope[];
    }
    /**
     * @see https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes#standard-claims
     */
    type Scope = "openid" | "profile" | "email" | string;
}
