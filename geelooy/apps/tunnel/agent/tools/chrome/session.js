// B"H
const { loadConfig } = require("../../lib/config.js");
const { ensurePage, cdpCall } = require("./cdp.js");
const { loadJar, saveJar, jarName } = require("../fs/httpCookieJar.js");

/**
 * B"H
 * Ensures the Chrome DevTools vessel is ready to receive session commands.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Config and port.
 */
async function ready(payload = {}) {
  const config = loadConfig();

  if (!config.chrome.enabled || !config.tools.chrome) {
    const err = new Error("chrome_disabled");
    err.code = "chrome_disabled";
    throw err;
  }

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensurePage(port, targetOptions(payload));
  return { config, port };
}

function targetOptions(payload = {}) {
  const targetId = payload.chromeTargetId || payload.pageId || payload.targetId || "";
  return {
    pageId: targetId,
    chromeTargetId: targetId,
    browserSessionId: payload.browserSessionId || "",
    roomId: payload.roomId || "",
    missionId: payload.missionId || "",
    agentSessionId: payload.agentSessionId || "",
    logicalAgentId: payload.logicalAgentId || "",
    shared: payload.shared === true,
    inspectShared: payload.inspectShared === true,
    force: payload.force === true,
    timeoutMs: payload.timeoutMs
  };
}

/**
 * B"H
 * Returns the current page URL when the caller did not provide one.
 *
 * @returns {Promise<string>} Current browser URL.
 */
async function currentUrl() {
  const res = await cdpCall("Runtime.evaluate", {
    expression: "location.href",
    returnByValue: true
  });

  return res.result?.value || "http://localhost/";
}

/**
 * B"H
 * Reads browser cookies through Chrome DevTools Protocol.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Cookie result.
 */
async function chromeCookies(payload = {}) {
  await ready(payload);

  const url = payload.url || await currentUrl();
  const res = await cdpCall("Network.getCookies", { urls: [url] });

  return {
    ok: true,
    action: "chromeCookies",
    url,
    count: res.cookies?.length || 0,
    cookies: (res.cookies || []).map(cookie => ({
      ...cookie,
      value: payload.includeValues === true ? cookie.value : ""
    }))
  };
}

/**
 * B"H
 * Sets one browser cookie through Chrome DevTools Protocol.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Set result.
 */
async function chromeCookieSet(payload = {}) {
  await ready(payload);

  const url = payload.url || await currentUrl();
  if (!payload.name) return { ok: false, action: "chromeCookieSet", error: "missing_cookie_name" };

  const params = {
    url,
    name: String(payload.name),
    value: String(payload.value || ""),
    path: payload.path || "/",
    secure: payload.secure === true,
    httpOnly: payload.httpOnly === true
  };

  if (payload.domain) params.domain = String(payload.domain).replace(/^\./, "");
  if (payload.sameSite) params.sameSite = payload.sameSite;
  if (payload.expires) {
    const ms = Date.parse(payload.expires);
    if (Number.isFinite(ms)) params.expires = Math.floor(ms / 1000);
  }

  const res = await cdpCall("Network.setCookie", params);

  return {
    ok: res.success !== false,
    action: "chromeCookieSet",
    url,
    name: params.name,
    domain: params.domain || new URL(url).hostname,
    path: params.path
  };
}

/**
 * B"H
 * Deletes one browser cookie through Chrome DevTools Protocol.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Delete result.
 */
async function chromeCookieDelete(payload = {}) {
  await ready(payload);

  const url = payload.url || await currentUrl();
  if (!payload.name) return { ok: false, action: "chromeCookieDelete", error: "missing_cookie_name" };

  const params = {
    url,
    name: String(payload.name)
  };

  if (payload.domain) params.domain = String(payload.domain).replace(/^\./, "");
  if (payload.path) params.path = payload.path;

  await cdpCall("Network.deleteCookies", params);

  return {
    ok: true,
    action: "chromeCookieDelete",
    url,
    name: params.name,
    domain: params.domain || "",
    path: params.path || ""
  };
}

/**
 * B"H
 * Reads localStorage or sessionStorage from the active page.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Storage result.
 */
async function chromeStorage(payload = {}) {
  await ready(payload);

  const type = payload.storageType === "sessionStorage" ? "sessionStorage" : "localStorage";
  const expression = `Object.fromEntries(Array.from({length:${type}.length}, (_, index) => { const key=${type}.key(index); return [key, ${type}.getItem(key)]; }))`;
  const res = await cdpCall("Runtime.evaluate", { expression, returnByValue: true });

  return {
    ok: true,
    action: "chromeStorage",
    storageType: type,
    values: res.result?.value || {}
  };
}

/**
 * B"H
 * Sets one localStorage/sessionStorage key.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Set result.
 */
async function chromeStorageSet(payload = {}) {
  await ready(payload);

  const type = payload.storageType === "sessionStorage" ? "sessionStorage" : "localStorage";
  if (!payload.name) return { ok: false, action: "chromeStorageSet", error: "missing_name" };

  await cdpCall("Runtime.evaluate", {
    expression: `${type}.setItem(${JSON.stringify(String(payload.name))}, ${JSON.stringify(String(payload.value || ""))})`,
    returnByValue: true
  });

  return { ok: true, action: "chromeStorageSet", storageType: type, name: String(payload.name) };
}

/**
 * B"H
 * Deletes one localStorage/sessionStorage key.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Delete result.
 */
async function chromeStorageDelete(payload = {}) {
  await ready(payload);

  const type = payload.storageType === "sessionStorage" ? "sessionStorage" : "localStorage";
  if (!payload.name) return { ok: false, action: "chromeStorageDelete", error: "missing_name" };

  await cdpCall("Runtime.evaluate", {
    expression: `${type}.removeItem(${JSON.stringify(String(payload.name))})`,
    returnByValue: true
  });

  return { ok: true, action: "chromeStorageDelete", storageType: type, name: String(payload.name) };
}

/**
 * B"H
 * Exports browser cookies and storage from the current page.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Export result.
 */
async function chromeSessionExport(payload = {}) {
  await ready(payload);

  const url = payload.url || await currentUrl();
  const cookies = await chromeCookies({ ...payload, url, includeValues: payload.includeValues === true });
  const local = await chromeStorage({ ...payload, storageType: "localStorage" });
  const session = await chromeStorage({ ...payload, storageType: "sessionStorage" });

  return {
    ok: true,
    action: "chromeSessionExport",
    url,
    cookies: cookies.cookies,
    localStorage: local.values,
    sessionStorage: session.values
  };
}

/**
 * B"H
 * Imports cookies and storage into Chrome.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Import result.
 */
async function chromeSessionImport(payload = {}) {
  await ready(payload);

  const url = payload.url || await currentUrl();
  const cookies = Array.isArray(payload.cookies) ? payload.cookies : [];
  let cookieCount = 0;

  for (const cookie of cookies) {
    const res = await chromeCookieSet({ ...cookie, url });
    if (res.ok) cookieCount++;
  }

  for (const [key, value] of Object.entries(payload.localStorage || {})) {
    await chromeStorageSet({
      ...payload,
      storageType: "localStorage",
      name: key,
      value
    });
  }

  for (const [key, value] of Object.entries(payload.sessionStorage || {})) {
    await chromeStorageSet({
      ...payload,
      storageType: "sessionStorage",
      name: key,
      value
    });
  }

  return {
    ok: true,
    action: "chromeSessionImport",
    url,
    cookieCount,
    localStorageCount: Object.keys(payload.localStorage || {}).length,
    sessionStorageCount: Object.keys(payload.sessionStorage || {}).length
  };
}

/**
 * B"H
 * Copies Chrome cookies into the native Node HTTP jar.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Bridge result.
 */
async function httpUseChromeCookies(payload = {}) {
  await ready(payload);

  const url = payload.url || await currentUrl();
  const chrome = await chromeCookies({ ...payload, url, includeValues: true });
  const name = payload.cookieJarName || payload.jar || "default";
  const jar = await loadJar(name);

  for (const cookie of chrome.cookies) {
    const mapped = {
      name: cookie.name,
      value: cookie.value,
      domain: String(cookie.domain || new URL(url).hostname).replace(/^\./, ""),
      path: cookie.path || "/",
      secure: !!cookie.secure,
      httpOnly: !!cookie.httpOnly,
      sameSite: cookie.sameSite || "",
      expires: cookie.expires ? Math.floor(cookie.expires * 1000) : null,
      createdAt: Date.now()
    };

    jar.cookies = jar.cookies.filter(existing =>
      !(existing.name === mapped.name && existing.domain === mapped.domain && existing.path === mapped.path)
    );
    jar.cookies.push(mapped);
  }

  await saveJar(name, jar);

  return {
    ok: true,
    action: "httpUseChromeCookies",
    url,
    jarName: jarName(name),
    copied: chrome.cookies.length
  };
}

/**
 * B"H
 * Copies native Node HTTP jar cookies into Chrome.
 *
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Bridge result.
 */
async function chromeUseHttpCookies(payload = {}) {
  await ready(payload);

  const url = payload.url || await currentUrl();
  const name = payload.cookieJarName || payload.jar || "default";
  const jar = await loadJar(name);
  let copied = 0;

  for (const cookie of jar.cookies) {
    const res = await chromeCookieSet({
      url,
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      expires: cookie.expires ? new Date(cookie.expires).toUTCString() : ""
    });

    if (res.ok) copied++;
  }

  return {
    ok: true,
    action: "chromeUseHttpCookies",
    url,
    jarName: jarName(name),
    copied,
    available: jar.cookies.length
  };
}

module.exports = {
  chromeCookies,
  chromeCookieSet,
  chromeCookieDelete,
  chromeStorage,
  chromeStorageSet,
  chromeStorageDelete,
  chromeSessionExport,
  chromeSessionImport,
  httpUseChromeCookies,
  chromeUseHttpCookies
};
