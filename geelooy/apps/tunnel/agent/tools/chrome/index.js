// B"H
// Boruch Hashem
// Blessed is He

const chromeActions = require("./actions.js");
const chromeExtras = require("./extras.js");
const chromeSession = require("./session.js");
const leaseActions = require("./leaseActions.js");
const ActionQueue = require("./actionQueue.js");

const READ_ONLY_ACTIONS = new Set([
	"chromeFind",
	"chromeStatus",
	"chromeTargets",
	"chromeLogs",
	"chromeNetwork"
]);

const ACTIONS = Object.freeze({
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

/**
 * Dispatches one Chrome action while protecting the single mutable CDP lane.
 * Read-only inspection may execute immediately, while navigation, typing, clicking,
 * session mutation, and composite browser checks are serialized through ActionQueue.
 * Every object result receives a queue snapshot so callers can prove the lane drained.
 * @param {object} payload Chrome action envelope containing at least an action name.
 * @returns {Promise<object|*>} Action result enriched with queue evidence when possible.
 */
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

/**
 * Gives the serialized Chrome lane enough time to outlive its inner stage budgets.
 * Composite browser checks may launch Chrome, reconnect CDP, navigate, wait for DOM,
 * inspect logs, and snapshot in sequence; the queue must never pre-empt those stages.
 * Explicit queue/action timeouts remain authoritative for callers needing a tighter bound.
 * @param {object} payload Chrome action request.
 * @returns {number|undefined} Outer queue timeout in milliseconds.
 */
function actionQueueTimeout(payload = {}) {
	const explicit = Number(payload.actionTimeoutMs || payload.queueTimeoutMs);
	if (Number.isFinite(explicit) && explicit > 0) return explicit;
	const operation = Number(payload.timeoutMs);
	if (!Number.isFinite(operation) || operation <= 0) return undefined;
	const action = String(payload.action || "");
	const composite = /^(?:chromeTestUrl|chromeDoctor|browserDoctor|browserTrace|browserInspect)$/.test(action);
	return composite
		? Math.max(60000, operation * 4 + 20000)
		: operation + 15000;
}

module.exports = { ACTIONS, READ_ONLY_ACTIONS, actionQueueTimeout, handleChrome };
