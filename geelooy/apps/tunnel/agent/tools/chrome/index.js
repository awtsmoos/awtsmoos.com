// B"H
// Boruch Hashem
// Blessed is He

const Actions = require("./actions.js");
const ActionQueue = require("./actionQueue.js");
const Extras = require("./extras.js");
const Native = require("./native.js");
const Common = require("./common.js");

const ACTIONS = Object.freeze({
	chromeFind: Actions.chromeFind,
	chromeLaunch: Actions.chromeLaunch,
	chromeStatus: Actions.chromeStatus,
	chromeTargets: Actions.chromeTargets,
	chromeTargetSelector: Extras.chromeTargetSelector,
	chromeNewPage: Actions.chromeNewPage,
	chromeClosePage: Actions.chromeClosePage,
	chromeCloseTabs: Actions.chromeCloseTabs,
	chromeNavigate: Actions.chromeNavigate,
	chromeWaitForSelector: Actions.chromeWaitForSelector,
	chromeClick: Actions.chromeClick,
	chromeType: Actions.chromeType,
	chromeEval: Actions.chromeEval,
	chromeLogs: Actions.chromeLogs,
	chromeSnapshot: Actions.chromeSnapshot,
	chromeScreenshot: Extras.chromeScreenshot,
	chromeRunScript: Actions.chromeRunScript,
	chromeNativeStatus: Native.chromeNativeStatus,
	chromeNativeOpen: Native.chromeNativeOpen,
	chromeNativeFocus: Native.chromeNativeFocus,
	chromeNativeClose: Native.chromeNativeClose
});

const READ_ONLY_ACTIONS = new Set([
	"chromeFind",
	"chromeStatus",
	"chromeTargets",
	"chromeTargetSelector",
	"chromeLogs",
	"chromeNativeStatus"
]);

/**
 * B"H
 *
 * Chrome actions enter one bounded mutation queue while read-only observations
 * remain concurrent. The Awtsmoos renews operation and deadline together;
 * Awtsmoos.com releases the queue when a stale CDP request stops answering.
 */
async function handleChrome(config, payload = {}) {
	const action = String(payload.action || "");
	const handler = ACTIONS[action];
	if (!handler) {
		return {
			ok: false,
			status: 400,
			error: "unsupported_chrome_action",
			action,
			availableActions: Object.keys(ACTIONS)
		};
	}
	const operation = () => handler({
		...payload,
		config
	});
	try {
		return READ_ONLY_ACTIONS.has(action)
			? await operation()
			: await ActionQueue.run(operation, {
				timeoutMs: Common.timeout(payload, 60000)
			});
	} catch (error) {
		return {
			ok: false,
			status: error.code === "CHROME_ACTION_TIMEOUT" ? 504 : 500,
			error: error.message || String(error),
			action,
			queue: ActionQueue.status()
		};
	}
}

module.exports = {
	ACTIONS,
	READ_ONLY_ACTIONS,
	handleChrome
};
