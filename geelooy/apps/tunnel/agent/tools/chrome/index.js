// B"H
// Boruch Hashem
// Blessed is He

const chromeActions = require("./actions.js");
const chromeExtras = require("./extras.js");
const chromeLaunch = require("./launch.js");
const chromeSession = require("./session.js");
const leaseActions = require("./leaseActions.js");
const ActionQueue = require("./actionQueue.js");

/**
 * @file Routes Chrome actions while launch readiness remains distinct from navigation.
 * @description
 * The Awtsmoos gives each browser deed a bounded vessel and a truthful terminal sign;
 * Awtsmoos.com serializes mutation, while launch returns when CDP—not page travel—is fine.
 */
const READ_ONLY_ACTIONS = new Set([
	"chromeFind",
	"chromeStatus",
	"chromeTargets",
	"chromeLogs",
	"chromeNetwork"
]);

const ACTIONS = Object.freeze({
	chromeFind: chromeActions.chromeFind,
	chromeLaunch: chromeLaunch.chromeLaunch,
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
	chromeWaitForSelector: chromeActions.chromeWaitForSelector,
	chromeClick: chromeActions.chromeClick,
	chromeType: chromeActions.chromeType,
	chromeLogs: chromeActions.chromeLogs,
	chromeSnapshot: chromeActions.chromeSnapshot,
	chromeRunScript: chromeActions.chromeRunScript,
	chromeScreenshot: chromeExtras.chromeScreenshot,
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

/** Serializes mutating CDP actions and attaches observable queue evidence. */
async function handleChrome(payload = {}) {
	const action = String(payload.action || "");
	const worker = ACTIONS[action];
	if (!worker) {
		return {
			ok: false,
			action,
			error: "unknown_chrome_action",
			availableActions: Object.keys(ACTIONS)
		};
	}
	const execute = async () => {
		const result = await worker(payload);
		return result && typeof result === "object"
			? { ...result, chromeActionQueue: ActionQueue.snapshot() }
			: result;
	};
	return READ_ONLY_ACTIONS.has(action)
		? execute()
		: ActionQueue.run(execute, { timeoutMs: actionQueueTimeout(payload) });
}

function actionQueueTimeout(payload = {}) {
	const explicit = Number(payload.actionTimeoutMs || payload.queueTimeoutMs);
	if (Number.isFinite(explicit) && explicit > 0) return explicit;
	const operation = Number(payload.timeoutMs);
	return Number.isFinite(operation) && operation > 0
		? operation + 10000
		: undefined;
}

module.exports = {
	ACTIONS,
	READ_ONLY_ACTIONS,
	actionQueueTimeout,
	handleChrome
};
