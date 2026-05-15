
// B"H

import { me } from "../api/control.js";

/**
 * B"H
 * Reads the current session and normalizes it.
 *
 * @returns {Promise<object>} Normalized session.
 */
export async function resolveSession() {
  const raw = await me();
  const ok = !!raw && raw.ok !== false;
  const identity = raw?.identity || raw?.user || raw || {};
  const userId = identity.userId || raw?.userId || "";

  return {
    ok,
    loggedIn: ok && !!userId,
    userId,
    kind: identity.kind || raw?.kind || "session",
    raw
  };
}
