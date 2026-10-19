// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actionRegistry.js
 * @description Declares the public Chrome action covenant and read-only lane for Awtsmoos.com.
 * The Awtsmoos names each browser vessel before motion begins;
 * bounded sight and mutable deeds remain distinct while one registry gathers their kin.
 */

const Frontend = require("./frontendVerifier.js");
const chromeActions = require("./actions.js");
const boundedActions = require("./boundedInteractionActions.js");
const chromeExtras = require("./extras.js");
const chromeSession = require("./session.js");
const leaseActions = require("./leaseActions.js");
const { captureBrowserTarget } = require("./targetCapture.js");
const { transformImage } = require("./nativeImageTransform.js");

const READ_ONLY_ACTIONS = new Set([
	"chromeFind",
	"chromeStatus",
	"chromeTargets",
	"chromeTargetSelector",
	"chromeEval",
	"chromeEvalSlim",
	"chromeWaitForSelector",
	"chromeSnapshot",
	"chromeLogs",
	"chromeNetwork",
	"captureBrowserTarget",
	"transformImage"
]);

const ACTIONS = Object.freeze({
	chromeVerifyFrontend: Frontend.verify,
	chromeFind: chromeActions.chromeFind,
	chromeLaunch: chromeActions.chromeLaunch,
	chromeStop: chromeActions.chromeStop,
	chromeStatus: chromeActions.chromeStatus,
	chromeTargets: chromeActions.chromeTargets,
	chromeTargetSelector: leaseActions.chromeTargetAcquire,
	chromeTargetAcquire: leaseActions.chromeTargetAcquire,
	chromeTargetRelease: leaseActions.chromeTargetRelease,
	chromeNewPage: chromeActions.chromeNewPage,
	chromeClosePage: chromeActions.chromeClosePage,
	chromeCloseTabs: chromeActions.chromeCloseTabs,
	chromeNavigate: chromeActions.chromeNavigate,
	chromeEval: chromeActions.chromeEval,
	chromeEvalSlim: chromeActions.chromeEval,
	chromeWaitForSelector: boundedActions.chromeWaitForSelector,
	chromeClick: chromeActions.chromeClick,
	chromeType: chromeActions.chromeType,
	chromeLogs: chromeActions.chromeLogs,
	chromeSnapshot: chromeActions.chromeSnapshot,
	chromeRunScript: chromeActions.chromeRunScript,
	chromeScreenshot: chromeActions.chromeScreenshot,
	captureBrowserTarget,
	transformImage,
	chromeNetwork: chromeExtras.chromeNetwork,
	chromeAccessibilitySnapshot: chromeExtras.chromeAccessibilitySnapshot,
	chromeTestUrl: chromeExtras.chromeTestUrl,
	chromeDoctor: chromeExtras.chromeDoctor,
	browserDoctor: chromeExtras.chromeDoctor,
	browserTrace: chromeExtras.chromeDoctor,
	browserInspect: chromeExtras.chromeDoctor,
	chromeCookies: chromeSession.chromeCookies,
	chromeCookieSet: chromeSession.chromeCookieSet,
	chromeCookieDelete: chromeSession.chromeCookieDelete,
	chromeStorage: chromeSession.chromeStorage,
	chromeStorageSet: chromeSession.chromeStorageSet,
	chromeStorageDelete: chromeSession.chromeStorageDelete,
	chromeSessionExport: chromeSession.chromeSessionExport,
	chromeSessionImport: chromeSession.chromeSessionImport,
	httpUseChromeCookies: chromeSession.httpUseChromeCookies,
	chromeUseHttpCookies: chromeSession.chromeUseHttpCookies
});

/** Returns the worker registered for one public Chrome action name. */
function workerFor(action) {
	return ACTIONS[action] || null;
}

/** Reports whether an action may bypass the serialized mutable Chrome lane. */
function isReadOnly(action) {
	return READ_ONLY_ACTIONS.has(action);
}

module.exports = {
	ACTIONS,
	READ_ONLY_ACTIONS,
	isReadOnly,
	workerFor
};
