// B"H
const { chromeLaunch, chromeStatus, chromeNavigate, chromeCloseTabs } = require("../../chrome/actions.js");
const { currentProfile, saveProfileState } = require("../storage/profileState.js");

/** B"H: launches/reuses dedicated ChatGPT profile and verifies navigation. */
async function ensureProfileChrome(payload = {}) {
  const name = payload.profile || payload.profileName || "default";
  const profile = await currentProfile(name);
  const port = Number(payload.port || payload.chromePort || profile.port || 9223);
  const url = payload.url || "https://chatgpt.com/";
  const status = await chromeStatus({ port, maxLogs: 50 });
  if (!status.connected) await chromeLaunch({ port, userDataDir: profile.userDataDir, url, headless:false, startupWaitMs:payload.startupWaitMs || 1800, maxLogs:80 });
  if (payload.closeOldTabs === true) await chromeCloseTabs({ port, chatgpt:true, keep:Number(payload.keepTabs || 1), browserSessionId:payload.browserSessionId, force:payload.forceCloseTabs === true }).catch(() => null);
  let navigation = null;
  if (payload.navigate !== false) navigation = await chromeNavigate({ ...payload, port, url, waitMs:payload.waitMs || 0, timeoutMs:payload.timeoutMs || 30000, snapshot:false });
  const saved = await saveProfileState(name, { port, userDataDir:profile.userDataDir, lastUrl:url, lastChromeEnsure:new Date().toISOString(), lastNavigation:navigation });
  return { ok:navigation ? navigation.ok !== false : true, action:"chatgptEnsureChrome", profile:saved, port, url, navigation, chromeTargetId:navigation?.chromeTargetId || "" };
}
module.exports = { ensureProfileChrome };
