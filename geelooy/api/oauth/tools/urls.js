
// B"H

function currentOrigin($i) {
  const headers = $i?.request?.headers || {};
  const host = headers["x-forwarded-host"] || headers.host || "awtsmoos.com";
  const proto = headers["x-forwarded-proto"] || "https";

  return String(proto).split(",")[0].trim() + "://" + String(host).split(",")[0].trim();
}

function currentFullUrl($i) {
  const url = $i?.request?.url || "/";
  return new URL(url, currentOrigin($i)).toString();
}

function urlWithParams(base, params = {}, origin = "https://awtsmoos.com") {
  const u = new URL(String(base || "/"), origin);

  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && String(v) !== "") {
      u.searchParams.set(k, String(v));
    }
  }

  return u.toString();
}

function fullUrlFor($i, pathname, params = {}) {
  return urlWithParams(pathname || "/", params, currentOrigin($i));
}

function localUrlFor(pathname, params = {}) {
  const u = new URL(String(pathname || "/"), "https://awtsmoos.local");

  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && String(v) !== "") {
      u.searchParams.set(k, String(v));
    }
  }

  return u.pathname + u.search + u.hash;
}

module.exports = {
  currentOrigin,
  currentFullUrl,
  urlWithParams,
  fullUrlFor,
  localUrlFor
};
