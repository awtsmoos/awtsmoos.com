
// B"H

import { getJson } from "./http.js";

/**
 * B"H
 * Builds a query string from present values.
 *
 * @param {Record<string, unknown>} params Query fields.
 * @returns {string} Query string with leading ? or empty string.
 */
function q(params = {}) {
  const u = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      u.set(key, String(value));
    }
  }

  const s = u.toString();
  return s ? "?" + s : "";
}

/**
 * B"H
 * Reads browser login identity.
 *
 * Required by features/status.js.
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
 * Reads active device by explicit tunnelName or legacy device endpoint.
 *
 * Required by features/status.js.
 *
 * @param {string} tunnelName Optional tunnel name.
 * @returns {Promise<object>} Device response.
 */
export async function device(tunnelName = "") {
  return await getJson("/api/tunnel/control/device" + q({ tunnelName }), {
    credentials: "include"
  });
}

/**
 * B"H
 * Discovers the signed-in user's active tunnel.
 *
 * @returns {Promise<object>} My-device response.
 */
export async function myDevice() {
  return await getJson("/api/tunnel/control/my-device", {
    credentials: "include"
  });
}

/**
 * B"H
 * Lists every connected device/tunnel visible to the signed-in account.
 *
 * @returns {Promise<object>} Devices response.
 */
export async function devices() {
  return await getJson("/api/tunnel/control/devices", {
    credentials: "include"
  });
}

/**
 * B"H
 * Alias for clean active-device flow.
 *
 * @returns {Promise<object>} Active device response.
 */
export async function activeDevice() {
  return await myDevice();
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
 * Lists API keys.
 *
 * @returns {Promise<object>} API key response.
 */
export async function apiKeys() {
  return await getJson("/api/tunnel/control/api-keys", {
    credentials: "include"
  });
}

/**
 * B"H
 * Creates an API key.
 *
 * @param {object} options Key options.
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
 * Revokes an API key.
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
 * @returns {Promise<object>} Docs JSON response.
 */
export async function docsJson() {
  return await getJson("/api/tunnel/control/docs.json", {
    credentials: "include"
  });
}
