// B"H
const { directAuth } = require("../direct/auth.js");

/**
 * B"H
 * Chapter 407: The Session Answered From Node, Not From The Page.
 *
 * The browser profile still shelters login, but the status check no longer
 * evaluates JavaScript inside ChatGPT. Node gathers the cookies through Chrome's
 * DevTools gate and asks `/api/auth/session` directly. The raw token stays
 * buried; only a redacted session summary rises back to the user.
 *
 * @param {object} payload ChatGPT auth payload.
 * @returns {Promise<{ok:boolean,action:string,port:number,session:object}>} Safe session state.
 */
async function sessionCheck(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const auth = await directAuth({ ...payload, port });
  return { ok: true, action: "chatgptSessionCheck", port, session: auth.session };
}

/**
 * B"H
 * Waits for login by repeatedly asking the direct Node session path. Each poll
 * is another measured knock on the palace gate; no prompt is sent, no composer
 * is touched, and no secret is printed.
 *
 * @param {object} payload ChatGPT auth payload.
 * @returns {Promise<object>} Session result or timeout summary.
 */
async function waitForSession(payload = {}) {
  const timeoutMs = Number(payload.timeoutMs || 180000);
  const start = Date.now();
  let last = null;
  while (Date.now() - start < timeoutMs) {
    last = await sessionCheck(payload);
    if (last.session?.authenticated) return { ...last, waitedMs: Date.now() - start };
    await new Promise(resolve => setTimeout(resolve, Number(payload.pollMs || 1500)));
  }
  return { ok: false, action: "chatgptWaitForSession", error: "login_timeout", waitedMs: Date.now() - start, lastSession: last?.session || null };
}

module.exports = { sessionCheck, waitForSession };
