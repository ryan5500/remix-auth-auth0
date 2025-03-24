export function redirect(url, init = 302) {
    let responseInit = init;
    if (typeof responseInit === "number") {
        responseInit = { status: responseInit };
    }
    else if (responseInit.status === undefined) {
        responseInit.status = 302;
    }
    let headers = new Headers(responseInit.headers);
    headers.set("Location", url);
    return new Response(null, { ...responseInit, headers });
}
//# sourceMappingURL=redirect.js.map