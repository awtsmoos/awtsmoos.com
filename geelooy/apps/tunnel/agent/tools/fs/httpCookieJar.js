// B"H
const fsp = require("fs/promises");
const path = require("path");
const { ROOT } = require("../../lib/config.js");

const JAR_DIR = path.join(ROOT, "http-cookie-jars");

/**
 * B"H
 * Normalizes a jar name into a small filesystem-safe name.
 *
 * @param {string} name Raw jar name.
 * @returns {string} Safe jar name.
 */
function jarName(name = "default") {
  return String(name || "default").toLowerCase().replace(/[^a-z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "") || "default";
}

/**
 * B"H
 * Returns the local persistence path for a cookie jar.
 *
 * @param {string} name Jar name.
 * @returns {string} Absolute JSON path.
 */
function jarPath(name = "default") {
  return path.join(JAR_DIR, jarName(name) + ".json");
}

/**
 * B"H
 * Loads a cookie jar from disk.
 *
 * @param {string} name Jar name.
 * @returns {Promise<object>} Jar object.
 */
async function loadJar(name = "default") {
  await fsp.mkdir(JAR_DIR, { recursive: true });

  try {
    const jar = JSON.parse(await fsp.readFile(jarPath(name), "utf8"));
    jar.cookies = Array.isArray(jar.cookies) ? jar.cookies : [];
    return jar;
  } catch (_e) {
    return { name: jarName(name), createdAt: Date.now(), cookies: [] };
  }
}

/**
 * B"H
 * Saves a jar atomically enough for local agent use.
 *
 * @param {string} name Jar name.
 * @param {object} jar Jar object.
 * @returns {Promise<void>}
 */
async function saveJar(name, jar) {
  await fsp.mkdir(JAR_DIR, { recursive: true });
  jar.name = jarName(name);
  jar.updatedAt = Date.now();
  await fsp.writeFile(jarPath(name), JSON.stringify(jar, null, 2), "utf8");
}

/**
 * B"H
 * Parses a Set-Cookie header into a simple persistent record.
 *
 * @param {string} line Set-Cookie header.
 * @param {URL} url URL that received it.
 * @returns {object|null} Cookie record.
 */
function parseSetCookie(line, url) {
  const parts = String(line || "").split(";").map(x => x.trim()).filter(Boolean);
  const first = parts.shift();
  if (!first || !first.includes("=")) return null;

  const at = first.indexOf("=");
  const cookie = {
    name: first.slice(0, at),
    value: first.slice(at + 1),
    domain: url.hostname,
    path: "/",
    secure: url.protocol === "https:",
    httpOnly: false,
    sameSite: "",
    expires: null,
    createdAt: Date.now()
  };

  for (const part of parts) {
    const eq = part.indexOf("=");
    const key = (eq === -1 ? part : part.slice(0, eq)).toLowerCase();
    const value = eq === -1 ? "" : part.slice(eq + 1);

    if (key === "domain") cookie.domain = value.replace(/^\./, "").toLowerCase();
    else if (key === "path") cookie.path = value || "/";
    else if (key === "secure") cookie.secure = true;
    else if (key === "httponly") cookie.httpOnly = true;
    else if (key === "samesite") cookie.sameSite = value;
    else if (key === "expires") {
      const ms = Date.parse(value);
      if (Number.isFinite(ms)) cookie.expires = ms;
    } else if (key === "max-age") {
      const seconds = Number(value);
      if (Number.isFinite(seconds)) cookie.expires = Date.now() + seconds * 1000;
    }
  }

  return cookie;
}

/**
 * B"H
 * Checks if a cookie belongs on a request URL.
 *
 * @param {object} cookie Cookie.
 * @param {URL} url Request URL.
 * @returns {boolean} Whether it matches.
 */
function cookieMatches(cookie, url) {
  if (cookie.expires && cookie.expires < Date.now()) return false;
  if (cookie.secure && url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();
  const domain = String(cookie.domain || "").toLowerCase().replace(/^\./, "");
  if (host !== domain && !host.endsWith("." + domain)) return false;

  const requestPath = url.pathname || "/";
  const cookiePath = cookie.path || "/";
  return requestPath.startsWith(cookiePath);
}

/**
 * B"H
 * Stores Set-Cookie headers into a named jar.
 *
 * @param {string} name Jar name.
 * @param {string[]} setCookieLines Header lines.
 * @param {string|URL} requestUrl Source URL.
 * @returns {Promise<object>} Store result.
 */
async function storeSetCookies(name, setCookieLines, requestUrl) {
  const url = requestUrl instanceof URL ? requestUrl : new URL(String(requestUrl));
  const jar = await loadJar(name);
  const incoming = setCookieLines.map(line => parseSetCookie(line, url)).filter(Boolean);

  for (const cookie of incoming) {
    jar.cookies = jar.cookies.filter(existing =>
      !(existing.name === cookie.name && existing.domain === cookie.domain && existing.path === cookie.path)
    );

    if (!cookie.expires || cookie.expires > Date.now()) jar.cookies.push(cookie);
  }

  jar.cookies = jar.cookies.filter(cookie => !cookie.expires || cookie.expires > Date.now());
  await saveJar(name, jar);

  return { ok: true, jarName: jarName(name), stored: incoming.length, cookies: incoming };
}

/**
 * B"H
 * Builds the Cookie header for a URL.
 *
 * @param {string} name Jar name.
 * @param {string|URL} requestUrl URL.
 * @returns {Promise<string>} Cookie header value.
 */
async function cookieHeader(name, requestUrl) {
  const url = requestUrl instanceof URL ? requestUrl : new URL(String(requestUrl));
  const jar = await loadJar(name);
  return jar.cookies.filter(cookie => cookieMatches(cookie, url)).map(cookie => cookie.name + "=" + cookie.value).join("; ");
}

/**
 * B"H
 * Lists cookie jars.
 *
 * @returns {Promise<object>} List result.
 */
async function listJars() {
  await fsp.mkdir(JAR_DIR, { recursive: true });
  const entries = await fsp.readdir(JAR_DIR);
  return {
    ok: true,
    action: "httpCookieJarList",
    jars: entries.filter(x => x.endsWith(".json")).map(x => x.replace(/\.json$/, ""))
  };
}

/**
 * B"H
 * Lists cookies from a jar.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Cookies result.
 */
async function listCookies(payload = {}) {
  const name = payload.cookieJarName || payload.jar || "default";
  const jar = await loadJar(name);
  const domain = payload.domain ? String(payload.domain).toLowerCase() : "";

  return {
    ok: true,
    action: "httpCookies",
    jarName: jarName(name),
    cookies: jar.cookies
      .filter(cookie => !domain || String(cookie.domain).toLowerCase().includes(domain))
      .map(cookie => ({ ...cookie, value: payload.includeValues === true ? cookie.value : "" }))
  };
}

/**
 * B"H
 * Sets or replaces one cookie in a jar.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Set result.
 */
async function setCookie(payload = {}) {
  const name = payload.cookieJarName || payload.jar || "default";
  const url = new URL(payload.url || "http://localhost/");
  const jar = await loadJar(name);

  const cookie = {
    name: String(payload.name || ""),
    value: String(payload.value || ""),
    domain: String(payload.domain || url.hostname).replace(/^\./, "").toLowerCase(),
    path: payload.path || "/",
    secure: payload.secure === true,
    httpOnly: payload.httpOnly === true,
    sameSite: payload.sameSite || "",
    expires: payload.expires ? Date.parse(payload.expires) : null,
    createdAt: Date.now()
  };

  if (!cookie.name) return { ok: false, action: "httpCookieSet", error: "missing_cookie_name" };

  jar.cookies = jar.cookies.filter(existing =>
    !(existing.name === cookie.name && existing.domain === cookie.domain && existing.path === cookie.path)
  );
  jar.cookies.push(cookie);
  await saveJar(name, jar);

  return { ok: true, action: "httpCookieSet", jarName: jarName(name), cookie: { ...cookie, value: payload.includeValues === true ? cookie.value : "" } };
}

/**
 * B"H
 * Deletes matching cookies from a jar.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Delete result.
 */
async function deleteCookie(payload = {}) {
  const name = payload.cookieJarName || payload.jar || "default";
  const jar = await loadJar(name);
  const before = jar.cookies.length;

  jar.cookies = jar.cookies.filter(cookie => {
    if (payload.name && cookie.name !== payload.name) return true;
    if (payload.domain && !String(cookie.domain).includes(String(payload.domain).replace(/^\./, ""))) return true;
    if (payload.path && cookie.path !== payload.path) return true;
    return false;
  });

  await saveJar(name, jar);

  return { ok: true, action: "httpCookieDelete", jarName: jarName(name), deleted: before - jar.cookies.length };
}

/**
 * B"H
 * Clears one jar.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Clear result.
 */
async function clearJar(payload = {}) {
  const name = payload.cookieJarName || payload.jar || "default";
  await saveJar(name, { name: jarName(name), createdAt: Date.now(), cookies: [] });
  return { ok: true, action: "httpSessionClear", jarName: jarName(name) };
}

module.exports = {
  jarName,
  loadJar,
  saveJar,
  storeSetCookies,
  cookieHeader,
  listJars,
  listCookies,
  setCookie,
  deleteCookie,
  clearJar
};
