// B"H

const jars = new Map();

function networkBase(action, payload = {}, extra = {}) {
  return {
    ok: true,
    action,
    resultType: "network-support-result",
    url: payload.url || payload.target || "",
    method: String(payload.method || "GET").toUpperCase(),
    generatedAt: new Date().toISOString(),
    ...extra
  };
}

function headers(payload = {}) {
  return payload.headers && typeof payload.headers === "object" ? payload.headers : {};
}

function httpRequest(action, payload = {}) {
  const method = String(payload.method || "GET").toUpperCase();
  return networkBase(action, payload, {
    request: {
      method,
      headers: headers(payload),
      bodyEncoding: payload.bodyEncoding || "utf8",
      hasBody: !!payload.body,
      followRedirects: payload.followRedirects !== false
    },
    response: {
      simulated: true,
      status: payload.url ? 200 : 0,
      bodyMode: payload.responseBodyMode || "text",
      note: payload.url ? "Support layer recorded an HTTP request contract without network side effects." : "No URL supplied."
    }
  });
}

function cookieJar(action, payload = {}) {
  const name = payload.cookieJarName || payload.jar || "default";
  if (!jars.has(name)) jars.set(name, []);
  const jar = jars.get(name);
  if (action === "httpCookieSet" && payload.name) {
    jar.push({ name: payload.name, value: payload.value || "", domain: payload.domain || "", path: payload.path || "/" });
  }
  if (action === "httpCookieDelete" && payload.name) {
    const next = jar.filter(c => c.name !== payload.name);
    jars.set(name, next);
  }
  if (action === "httpSessionClear") jars.set(name, []);
  return networkBase(action, payload, { jar: name, count: (jars.get(name) || []).length, cookies: (jars.get(name) || []).slice(0, Number(payload.limit || 50)) });
}

function apiProbe(action, payload = {}) {
  return networkBase(action, payload, {
    endpoint: payload.url || payload.path || payload.p || "",
    checks: {
      hasEndpoint: !!(payload.url || payload.path || payload.p),
      method: String(payload.method || "GET").toUpperCase(),
      getFirst: String(payload.method || "GET").toUpperCase() === "GET"
    },
    recommendation: "Keep tunnel control endpoints GET-compatible with equivalent POST body parsing."
  });
}

function dispatchNetworkSupport(action, payload = {}) {
  if (/Cookie|Session|Cookies/.test(action)) return cookieJar(action, payload);
  if (/api|endpoint|contract|transport|oauth|network|trace/i.test(action)) return apiProbe(action, payload);
  if (action === "httpJson") return { ...httpRequest(action, payload), parsedJson: payload.body ? null : {} };
  if (action === "httpDownload") return { ...httpRequest(action, payload), savedTo: payload.saveResponseTo || payload.to || null };
  return httpRequest(action, payload);
}

module.exports = { dispatchNetworkSupport, httpRequest, cookieJar, apiProbe };
