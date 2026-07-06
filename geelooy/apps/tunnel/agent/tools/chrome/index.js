// B"H
const chromeActions = require("./actions.js");
const chromeExtras = require("./extras.js");
const chromeSession = require("./session.js");
const ACTIONS = {
  chromeFind: chromeActions.chromeFind, chromeLaunch: chromeActions.chromeLaunch, chromeStatus: chromeActions.chromeStatus,
  chromeTargets: chromeActions.chromeTargets, chromeTargetSelector: chromeActions.chromeTargetSelector, chromeNewPage: chromeActions.chromeNewPage,
  chromeClosePage: chromeActions.chromeClosePage, chromeCloseTabs: chromeActions.chromeCloseTabs, chromeNavigate: chromeActions.chromeNavigate,
  chromeEval: chromeActions.chromeEval, chromeWaitForSelector: chromeActions.chromeWaitForSelector, chromeClick: chromeActions.chromeClick,
  chromeType: chromeActions.chromeType, chromeLogs: chromeActions.chromeLogs, chromeSnapshot: chromeActions.chromeSnapshot,
  chromeRunScript: chromeActions.chromeRunScript, chromeScreenshot: chromeExtras.chromeScreenshot, chromeNetwork: chromeExtras.chromeNetwork,
  chromeAccessibilitySnapshot: chromeExtras.chromeAccessibilitySnapshot, chromeTestUrl: chromeExtras.chromeTestUrl, chromeDoctor: chromeExtras.chromeDoctor,
  browserDoctor: chromeExtras.chromeDoctor, browserTrace: chromeExtras.chromeDoctor, browserInspect: chromeExtras.chromeDoctor,
  chromeCookies: chromeSession.chromeCookies, chromeCookieSet: chromeSession.chromeCookieSet, chromeCookieDelete: chromeSession.chromeCookieDelete,
  chromeStorage: chromeSession.chromeStorage, chromeStorageSet: chromeSession.chromeStorageSet, chromeStorageDelete: chromeSession.chromeStorageDelete,
  chromeSessionExport: chromeSession.chromeSessionExport, chromeSessionImport: chromeSession.chromeSessionImport,
  httpUseChromeCookies: chromeSession.httpUseChromeCookies, chromeUseHttpCookies: chromeSession.chromeUseHttpCookies
};
async function handleChrome(payload = {}) { const fn = ACTIONS[payload.action]; return fn ? await fn(payload) : { ok:false, action:payload.action, error:"unknown_chrome_action", availableActions:Object.keys(ACTIONS) }; }
module.exports = { handleChrome, ACTIONS };
