// B"H
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { sessionCheck, waitForSession } = require("../auth/sessionCheck.js");
const { saveProfileState } = require("../storage/profileState.js");

/**
 * B"H
 * Opens the dedicated profile at ChatGPT. If wait=true, this action waits while
 * the user logs in manually and then records safe session metadata.
 */
async function chatgptLogin(payload = {}) {
  const launched = await ensureProfileChrome({ ...payload, url: "https://chatgpt.com/", navigate: true });
  const check = payload.wait === true || payload.wait === "true" ? await waitForSession({ ...payload, port: launched.port }) : await sessionCheck({ ...payload, port: launched.port });
  if (check.session?.authenticated) await saveProfileState(payload.profile || "default", { port: launched.port, authenticated: true, user: check.session.user, lastVerified: new Date().toISOString() });
  return { ok: true, action: "chatgptLogin", loginUrl: "https://chatgpt.com/", profile: launched.profile, port: launched.port, session: check.session || check.lastSession || null, needsManualLogin: !check.session?.authenticated };
}

module.exports = { chatgptLogin };
