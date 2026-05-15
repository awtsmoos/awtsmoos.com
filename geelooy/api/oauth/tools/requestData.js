
// B"H
const querystring = require("querystring");

function getQuery($i) {
  return $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {};
}

function headersOf($i) {
  return $i.request?.headers || {};
}

function contentTypeOf($i) {
  const h = headersOf($i);
  return String(h["content-type"] || h["Content-Type"] || "").toLowerCase();
}

function rawBodyOf(body) {
  if (!body) return "";
  const raw = body.__raw_body__ || body.rawBody || body.body || "";
  if (Buffer.isBuffer(raw)) return raw.toString("utf8");
  if (typeof raw === "string") return raw;
  return "";
}

function parseRawBody($i, body) {
  const raw = rawBodyOf(body);
  if (!raw) return {};
  const type = contentTypeOf($i);

  if (type.includes("application/json") || raw.trim().startsWith("{")) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }

  if (type.includes("x-www-form-urlencoded") || raw.includes("=")) {
    return querystring.parse(raw);
  }

  return {};
}

async function getBody($i) {
  try {
    if ($i.request?.method !== "POST") return {};
    if (typeof $i.getPostData === "function") await $i.getPostData();

    const body = $i.paramKinds?.POST || $i.$_POST || $i.request?.body || {};
    return { ...parseRawBody($i, body), ...body };
  } catch (e) {
    return {};
  }
}

function getBasicClientAuth($i) {
  const auth = headersOf($i).authorization || headersOf($i).Authorization || "";
  if (!/^Basic\s+/i.test(auth)) return {};
  try {
    const raw = Buffer.from(auth.replace(/^Basic\s+/i, ""), "base64").toString("utf8");
    const at = raw.indexOf(":");
    if (at < 0) return {};
    return { client_id: raw.slice(0, at), client_secret: raw.slice(at + 1) };
  } catch (e) {
    return {};
  }
}

async function getTokenRequest($i) {
  const q = getQuery($i);
  const body = await getBody($i);
  const basic = getBasicClientAuth($i);

  return {
    grant_type: body.grant_type || q.grant_type || "authorization_code",
    client_id: body.client_id || q.client_id || basic.client_id || "chatgpt",
    client_secret: body.client_secret || q.client_secret || basic.client_secret || "",
    code: body.code || q.code || "",
    redirect_uri: body.redirect_uri || q.redirect_uri || "",
    scope: body.scope || q.scope || ""
  };
}

function debugRequestShape($i, body) {
  const q = getQuery($i);
  const headers = headersOf($i);
  return {
    method: $i.request?.method || "",
    content_type: headers["content-type"] || headers["Content-Type"] || "",
    query_keys: Object.keys(q),
    body_keys: Object.keys(body || {}).filter(k => k !== "__raw_body__"),
    has_raw_body: !!rawBodyOf(body || {})
  };
}

module.exports = {
  getQuery,
  getBody,
  getBasicClientAuth,
  getTokenRequest,
  debugRequestShape
};
