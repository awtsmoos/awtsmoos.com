// B"H
const { chromeLaunch, chromeStatus, chromeNavigate } = require("../../chrome/actions.js");
const { currentProfile, saveProfileState } = require("../storage/profileState.js");

/**
 * B"H
 * Launches or reuses Chrome with the dedicated ChatGPT profile. The profile is
 * the durable authenticated vessel; no cookie file is exported by this layer.
 */
async function ensureProfileChrome(payload = {}) {
  const name = payload.profile || payload.profileName || "default";
  const profile = await currentProfile(name);
  const port = Number(payload.port || payload.chromePort || profile.port || 9223);
  const url = payload.url || "https://chatgpt.com/";
  const status = await chromeStatus({ port, maxLogs: 50 });
  if (!status.connected) {
    await chromeLaunch({ port, userDataDir: profile.userDataDir, url, headless: false, startupWaitMs: payload.startupWaitMs || 1800, maxLogs: 80 });
  } else if (payload.navigate !== false) {
    await chromeNavigate({ port, url, waitMs: payload.waitMs || 0, timeoutMs: payload.timeoutMs || 30000, snapshot: false });
  }
  const saved = await saveProfileState(name, { port, userDataDir: profile.userDataDir, lastUrl: url, lastChromeEnsure: new Date().toISOString() });
  return { ok: true, action: "chatgptEnsureChrome", profile: saved, port, url };
}

module.exports = { ensureProfileChrome };
