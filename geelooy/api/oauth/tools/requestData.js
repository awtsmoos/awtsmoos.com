
// B"H

function getQuery($i) {
  return $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {};
}

async function getBody($i) {
  try {
    if ($i.request?.method !== "POST") return {};

    if (typeof $i.getPostData === "function") {
      await $i.getPostData();
    }

    return $i.paramKinds?.POST || $i.$_POST || $i.request?.body || {};
  } catch (e) {
    return {};
  }
}

function getBasicClientAuth($i) {
  const headers = $i.request?.headers || {};
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

module.exports = {
  getQuery,
  getBody,
  getBasicClientAuth,
  getTokenRequest
};
