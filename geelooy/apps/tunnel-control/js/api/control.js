
// B"H

import { getJson } from "./http.js";

/**
 * B"H
 * Builds a query string from defined values.
 *
 * @param {Record<string, unknown>} params Query fields.
 * @returns {string} Encoded query string with a leading question mark.
 */
function q(params = {}) {
  const u = new URLSearchParams();

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      u.set(k, String(v));
    }
  }

  const s = u.toString();
  return s ? "?" + s : "";
}

/**
 * B"H
 * Calls JSON POST.
 *
 * @param {string} url Endpoint URL.
 * @param {object} body JSON body.
 * @returns {Promise<object>} Parsed response.
 */
async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body || {})
  });

  const text = await res.text();

  try {
    const data = JSON.parse(text);
    if (!res.ok && data.ok !== false) data.ok = false;
    return data;
  } catch (e) {
    return {
      BH: "B\"H",
      ok: false,
      error: "non_json_response",
      status: res.status,
      text
    };
  }
}

/**
 * B"H
 * Reads bootstrap instructions.
 *
 * @returns {Promise<object>} Bootstrap response.
 */
export async function bootstrap() {
  return await getJson("/api/tunnel/control/bootstrap", {
    credentials: "include"
  });
}

/**
 * B"H
 * Discovers the signed-in user's active tunnel.
 *
 * This is the correct no-query control-panel path. The app should not
 * require /apps/tunnel-control/?tunnelName=... for normal usage.
 *
 * @returns {Promise<object>} Device discovery response.
 */
export async function myDevice() {
  return await getJson("/api/tunnel/control/my-device", {
    credentials: "include"
  });
}

/**
 * B"H
 * Backward-compatible alias for older feature modules.
 *
 * @param {string} [tunnelName] Optional explicit tunnel name.
 * @returns {Promise<object>} Device response.
 */
export async function device(tunnelName = "") {
  if (!tunnelName) return await myDevice();

  return await getJson("/api/tunnel/control/my-device" + q({ tunnelName }), {
    credentials: "include"
  });
}

/**
 * B"H
 * Preferred active-device alias.
 *
 * @returns {Promise<object>} Active device response.
 */
export async function activeDevice() {
  return await myDevice();
}

/**
 * B"H
 * Runs a controlled tunnel action through POST.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} body Action body.
 * @returns {Promise<object>} Tunnel response.
 */
export async function tunnelActionPost(tunnelName, body) {
  return await postJson(
    "/api/tunnel/control/fs/" + encodeURIComponent(tunnelName),
    body
  );
}

/**
 * B"H
 * Runs a small controlled tunnel action through GET.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {Record<string, unknown>} params Query params.
 * @returns {Promise<object>} Tunnel response.
 */
export async function tunnelAction(tunnelName, params = {}) {
  return await getJson(
    "/api/tunnel/control/fs/" + encodeURIComponent(tunnelName) + q(params),
    { credentials: "include" }
  );
}

/**
 * B"H
 * Lists API keys.
 *
 * @returns {Promise<object>} API keys response.
 */
export async function apiKeys() {
  return await getJson("/api/tunnel/control/api-keys", {
    credentials: "include"
  });
}

/**
 * B"H
 * Creates a scoped API key.
 *
 * @param {object} options Key creation options.
 * @returns {Promise<object>} Create response.
 */
export async function createApiKey(options = {}) {
  const {
    name = "Tunnel API Key",
    scopes = ["tunnel.read"],
    rateLimitPerMinute = 60,
    bytesPerDay = 50000000
  } = options;

  return await getJson("/api/tunnel/control/api-keys/create" + q({
    name,
    scopes: Array.isArray(scopes) ? scopes.join(" ") : String(scopes || ""),
    rateLimitPerMinute,
    bytesPerDay
  }), {
    credentials: "include"
  });
}

/**
 * B"H
 * Revokes a key.
 *
 * @param {string} keyId Key id.
 * @returns {Promise<object>} Revoke response.
 */
export async function revokeApiKey(keyId) {
  return await getJson("/api/tunnel/control/api-keys/revoke" + q({ keyId }), {
    credentials: "include"
  });
}

/**
 * B"H
 * Reads usage.
 *
 * @returns {Promise<object>} Usage response.
 */
export async function usage() {
  return await getJson("/api/tunnel/control/usage", {
    credentials: "include"
  });
}

/**
 * B"H
 * Reads machine docs.
 *
 * @returns {Promise<object>} Docs response.
 */
export async function docsJson() {
  return await getJson("/api/tunnel/control/docs.json", {
    credentials: "include"
  });
}
