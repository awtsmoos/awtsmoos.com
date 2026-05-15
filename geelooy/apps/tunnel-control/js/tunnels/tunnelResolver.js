
// B"H

import { myDevice, device } from "../api/control.js";
import { state, rememberTunnelName, forgetTunnelName } from "../state/state.js";
import { extractTunnelName, extractRoot, extractPermissions } from "./extractTunnel.js";

/**
 * B"H
 * Resolves the active tunnel.
 *
 * Normal flow:
 * /apps/tunnel-control/ -> OAuth/session -> /my-device -> tunnel.
 *
 * Query tunnelName remains only as a backward-compatible dev override.
 *
 * @returns {Promise<object>} Normalized tunnel result.
 */
export async function resolveActiveTunnel() {
  const attempts = [];

  if (state.urlTunnelOverride) {
    attempts.push(() => device(state.urlTunnelOverride));
  }

  attempts.push(() => myDevice());

  if (state.tunnelName && state.tunnelName !== state.urlTunnelOverride) {
    attempts.push(() => device(state.tunnelName));
  }

  for (const attempt of attempts) {
    try {
      const raw = await attempt();
      if (!raw || raw.ok === false) continue;

      const tunnelName = extractTunnelName(raw);
      if (!tunnelName) continue;

      rememberTunnelName(tunnelName);

      return {
        ok: true,
        tunnelName,
        root: extractRoot(raw),
        permissions: extractPermissions(raw),
        raw
      };
    } catch (e) {
      continue;
    }
  }

  forgetTunnelName();

  return {
    ok: false,
    tunnelName: "",
    root: ".",
    permissions: {},
    raw: null
  };
}
