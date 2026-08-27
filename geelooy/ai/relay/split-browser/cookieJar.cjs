//B"H
const jar = new Map();

/**
 * Chapter 8: The Jar Remembered The Sparks.
 *
 * Node carries upstream cookies in memory and also respects cookies the local
 * browser sends back. Nothing is exposed in logs; only names are summarized.
 *
 * @param {string[]|string|null} setCookieValues Upstream Set-Cookie values.
 * @returns {void}
 */
function storeCookies(setCookieValues) {
  const values = Array.isArray(setCookieValues) ? setCookieValues : setCookieValues ? [setCookieValues] : [];
  for (const raw of values) {
    const first = String(raw).split(";")[0];
    const eq = first.indexOf("=");
    if (eq > 0) jar.set(first.slice(0, eq).trim(), first.slice(eq + 1).trim());
  }
}

/**
 * @param {string|string[]|undefined} browserCookie Cookie header from local browser.
 * @returns {string} Merged Cookie header for upstream requests.
 */
function mergedCookieHeader(browserCookie) {
  const merged = new Map();
  for (const part of normalizeCookie(browserCookie)) merged.set(part.key, part.value);
  for (const [key, value] of jar.entries()) merged.set(key, value);
  return [...merged.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
}

/** @returns {string} Cookie header for upstream requests. */
function cookieHeader() {
  return mergedCookieHeader("");
}

function normalizeCookie(cookie) {
  const text = Array.isArray(cookie) ? cookie.join("; ") : String(cookie || "");
  return text.split(";").map(part => part.trim()).filter(Boolean).map(part => {
    const eq = part.indexOf("=");
    return eq > 0 ? { key: part.slice(0, eq), value: part.slice(eq + 1) } : null;
  }).filter(Boolean);
}

/** @returns {{count:number,names:string[]}} Safe jar summary. */
function cookieSummary() {
  return { count: jar.size, names: [...jar.keys()].slice(0, 20) };
}

module.exports = { storeCookies, cookieHeader, mergedCookieHeader, cookieSummary };
