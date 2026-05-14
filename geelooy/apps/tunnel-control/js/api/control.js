
// B"H

import { getJson } from "./http.js";

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

export async function me() {
  return await getJson("/api/tunnel/control/me", {
    credentials: "include"
  });
}

export async function device(tunnelName = "") {
  return await getJson("/api/tunnel/control/device" + q({ tunnelName }), {
    credentials: "include"
  });
}

export async function apiKeys() {
  return await getJson("/api/tunnel/control/api-keys", {
    credentials: "include"
  });
}

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

export async function revokeApiKey(keyId) {
  return await getJson("/api/tunnel/control/api-keys/revoke" + q({ keyId }), {
    credentials: "include"
  });
}

export async function usage() {
  return await getJson("/api/tunnel/control/usage", {
    credentials: "include"
  });
}

export async function docsJson() {
  return await getJson("/api/tunnel/control/docs.json", {
    credentials: "include"
  });
}
