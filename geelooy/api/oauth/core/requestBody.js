
// B"H

function queryFromRequest($i) {
  return (
    $i.paramKinds?.GET ||
    $i.$_GET ||
    $i.request?.query ||
    {}
  );
}

function postFromRequest($i) {
  return (
    $i.paramKinds?.POST ||
    $i.$_POST ||
    $i.request?.body ||
    {}
  );
}

function headersFromRequest($i) {
  return $i.request?.headers || {};
}

function readAuthBasic($i) {
  const headers = headersFromRequest($i);
  const auth = headers.authorization || headers.Authorization || "";

  if (!/^Basic\s+/i.test(auth)) return {};

  try {
    const raw = Buffer.from(auth.replace(/^Basic\s+/i, ""), "base64").toString("utf8");
    const at = raw.indexOf(":");

    if (at < 0) return {};

    return {
      client_id: raw.slice(0, at),
      client_secret: raw.slice(at + 1)
    };
  } catch (e) {
    return {};
  }
}

function normalizeTokenRequest($i) {
  const get = queryFromRequest($i);
  const post = postFromRequest($i);
  const basic = readAuthBasic($i);

  /**
   * ChatGPT normally posts these fields in a token request:
   * grant_type, client_id, client_secret, code, redirect_uri.
   *
   * This helper accepts all common shapes:
   * - parsed urlencoded body
   * - parsed JSON body
   * - query fallback
   * - Basic auth client credentials
   */
  return {
    grant_type: post.grant_type || get.grant_type || "authorization_code",
    client_id: post.client_id || get.client_id || basic.client_id || "",
    client_secret: post.client_secret || get.client_secret || basic.client_secret || "",
    code: post.code || get.code || "",
    redirect_uri: post.redirect_uri || get.redirect_uri || "",
    scope: post.scope || get.scope || ""
  };
}

module.exports = {
  normalizeTokenRequest
};
