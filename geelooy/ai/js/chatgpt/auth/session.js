//B"H

let authToken = null;
let token = null;

/**
 * B"H — Old working logic: call `/api/auth/session`, read `accessToken`, cache it.
 * No cookie-only replacement, no altered endpoint, no invented headers.
 */
export async function getAuthToken(mFetch) {
  if (authToken) return authToken;
  var sesh = await mFetch("https://chatgpt.com/api/auth/session");
  var j = await sesh.json();
  var summary = {
    status: sesh.status,
    ok: sesh.ok,
    keys: Object.keys(j || {}),
    hasAccessToken: Boolean(j?.accessToken),
    hasUser: Boolean(j?.user),
    warningOnly: Boolean(j?.WARNING_BANNER && Object.keys(j || {}).length === 1)
  };
  console.log("B\"H legacy auth session JSON", JSON.stringify(summary));
  var found = j.accessToken;
  if (found) {
    authToken = found;
    token = found;
    return found;
  }
  console.warn("B\"H legacy auth session returned no accessToken JSON", JSON.stringify(summary));
  return null;
}

export async function ensureToken(mFetch) {
  if (!token) token = await getAuthToken(mFetch);
  return token;
}

export function setToken(next) {
  token = next;
  authToken = next;
  return token;
}

export function getCachedToken() {
  return token || authToken;
}
