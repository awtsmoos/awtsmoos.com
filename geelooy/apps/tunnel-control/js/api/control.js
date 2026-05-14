
// B"H

import { getJson, postForm } from "./http.js";

export function controlMe() {
  return getJson("/api/tunnel/control/me");
}

export function device(tunnelName) {
  return getJson("/api/tunnel/control/device?tunnelName=" + encodeURIComponent(tunnelName || ""));
}

export function apiKeys() {
  return getJson("/api/tunnel/control/api-keys");
}

export function createApiKey(data) {
  return postForm("/api/tunnel/control/api-keys/create", data);
}

export function revokeApiKey(keyId) {
  return postForm("/api/tunnel/control/api-keys/revoke", { keyId });
}

export function usage() {
  return getJson("/api/tunnel/control/usage");
}
