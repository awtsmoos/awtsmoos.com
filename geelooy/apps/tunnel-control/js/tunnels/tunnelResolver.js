
// B"H

import { activeDevice, device } from "../api/control.js";
import { state, rememberTunnelName, forgetTunnelName } from "../state/state.js";
import { extractTunnelName, extractRoot } from "./extractTunnel.js";

/**
 * B"H
 * Resolves the active tunnel.
 *
 * Priority:
 * 1. URL override, only for dev/backward compatibility.
 * 2. Server-side active tunnel for logged-in user.
 * 3. Locally remembered tunnel as fallback.
 *
 * @returns {Promise<object>} Normalized tunnel result.
 */
export async function resolveActiveTunnel() {
  const attempts = [];

  if (state.urlTunnelOverride) {
    attempts.push(() => device(state.urlTunnelOverride));
  }

  attempts.push(() => activeDevice());

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
    raw: null
  };
}
