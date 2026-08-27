
// B"H

import { getJson } from "./http.js";
import { controlMe } from "./control.js";

export async function detectLogin() {
  const controlPromise = controlMe().catch(e => ({
    ok: false,
    error: e.message,
    source: "control"
  }));

  const oauthPromise = getJson("/api/oauth/start?client_id=chatgpt").catch(e => ({
    ok: false,
    error: e.message,
    source: "oauthStart"
  }));

  const [control, oauthStart] = await Promise.all([
    controlPromise,
    oauthPromise
  ]);

  const loggedIn = !!(
    control?.ok ||
    oauthStart?.loggedIn ||
    oauthStart?.user
  );

  return {
    ok: loggedIn,
    control,
    oauthStart,
    user:
      control?.identity ||
      oauthStart?.user ||
      null
  };
}
