
// B"H

import { getJson } from "./http.js";

/**
 * B"H
 * Builds a query string from defined values.
 *
 * @param {Record<string, unknown>} params Query fields.
 * @returns {string} Encoded query string with leading question mark.
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
 * Reads browser login/session identity.
 *
 * @returns {Promise<object>} Identity response.
 */
export async function me() {
  return await getJson("/api/tunnel/control/me", {
    credentials: "include"
  });
}

/**
 * B"H
 * Reads a device by tunnel name.
 *
 * If tunnelName is omitted, the server is allowed to resolve the single
 * active tunnel for the logged-in user.
 *
 * @param {string} [tunnelName] Optional tunnel name.
 * @returns {Promise<object>} Device response.
 */
export async function device(tunnelName) {
  return await getJson("/api/tunnel/control/device" + q({ tunnelName }), {
    credentials: "include"
  });
}

/**
 * B"H
 * Alias that documents the intended no-query flow.
 *
 * @returns {Promise<object>} Active device response.
 */
export async function activeDevice() {
  return await device("");
}

/**
 * B"H
 * Lists API keys for the logged-in user.
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
 * @param {string} [options.name] Key name.
 * @param {string[]} [options.scopes] Key scopes.
 * @param {number} [options.rateLimitPerMinute] Rate limit.
 * @param {number} [options.bytesPerDay] Daily byte limit.
 * @returns {Promise<object>} Create response.
 */
export async function createApiKey({
  name = "Tunnel API Key",
  scopes = ["tunnel.read"],
  rateLimitPerMinute = 60,
  bytesPerDay = 50000000
} = {}) {
  return await getJson("/api/tunnel/control/api-keys/create" + q({
    name,
    scopes: scopes.join(" "),
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
