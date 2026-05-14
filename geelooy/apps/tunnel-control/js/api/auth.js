
// B"H

import { getJson } from "./http.js";
import { controlMe } from "./control.js";

/**
 * B"H
 * Checks login using both the tunnel control identity route and the OAuth
 * start route that already knows how to detect the Awtsmoos session.
 */
export async function detectLogin() {
  const [control, oauthStart] = await Promise.all([
    controlMe().catch(e => ({ ok: false, error: e.message })),
    getJson("/api/oauth/start?client_id=chatgpt").catch(e => ({ ok: false, error: e.message }))
  ]);

  const loggedIn = !!(control.ok || oauthStart.loggedIn);

  return {
    ok: loggedIn,
    control,
    oauthStart,
    user:
      control.identity ||
      oauthStart.user ||
      null
  };
}
