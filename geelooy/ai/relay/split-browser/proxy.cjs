//B"H
const { send, readBody } = require("./http.cjs");
const { mergedCookieHeader, storeCookies } = require("./cookieJar.cjs");
const { log } = require("./logger.cjs");
const { toUpstream, toLocal } = require("./urlMap.cjs");
const { upstreamHeaders, responseHeaders, getSetCookie } = require("./headerMap.cjs");
const { transformBody } = require("./bodyTransform.cjs");

/**
 * Chapter 25: The Proxy Became A Witness, Not An Author.
 *
 * Every request to localhost is copied to ChatGPT with the same method, same
 * path/query, same body bytes, and nearly the same headers. Only forbidden
 * transport headers and localhost identity are reshaped. The terminal records
 * enough safe facts to prove what traveled.
 *
 * @param {import('http').IncomingMessage} req Incoming local request.
 * @param {import('http').ServerResponse} res Local response.
 * @param {{targetOrigin:string,verbose:boolean}} config Runtime config.
 * @returns {Promise<void>}
 */
async function proxyChatGpt(req, res, config) {
  const local = new URL(req.url, "http://127.0.0.1");
  const target = toUpstream(local, config.targetOrigin);
  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await readBody(req) : undefined;
  const cookie = mergedCookieHeader(req.headers.cookie);
  const headers = upstreamHeaders(req.headers, config.targetOrigin, cookie);
  log(config, "proxy:request", {
    method: req.method,
    local: local.pathname + local.search,
    target,
    bodyBytes: body ? body.length : 0,
    requestHeaderNames: Object.keys(req.headers || {}).sort(),
    upstreamHeaderNames: Object.keys(headers || {}).sort(),
    contentType: req.headers["content-type"] || "",
    hasCookie: !!cookie,
    dataRoute: local.searchParams.get("_data") || ""
  });
  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
    ...(hasBody ? { duplex: "half" } : {})
  });
  storeCookies(getSetCookie(upstream.headers));
  const type = upstream.headers.get("content-type") || "application/octet-stream";
  const responseHeaderBag = responseHeaders(upstream.headers, type);
  if (upstream.status >= 300 && upstream.status < 400) responseHeaderBag.location = toLocal(upstream.headers.get("location"), config.targetOrigin);
  const bytes = Buffer.from(await upstream.arrayBuffer());
  const transformed = transformBody(bytes, type, local, config.targetOrigin);
  log(config, "proxy:response", {
    status: upstream.status,
    type,
    bytes: bytes.length,
    url: upstream.url,
    location: responseHeaderBag.location || "",
    responseHeaderNames: [...upstream.headers.keys()].sort(),
    rewrite: transformed.rewrite,
    mode: transformed.mode
  });
  send(res, upstream.status, transformed.body, responseHeaderBag);
}

module.exports = { proxyChatGpt };
