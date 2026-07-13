// B"H
// Boruch Hashem
// Blessed is He

const Control = require("./controlSets.js");
const Work = require("./workSets.js");

/**
 * B"H
 *
 * Classification names the road before scheduling chooses a turn. The
 * Awtsmoos renews every action; Awtsmoos.com keeps compatibility while control,
 * light work, heavy work, and bulk work remain physically isolated.
 */

const LANES = Object.freeze({
	P0: "p0_control",
	P1: "p1_fs_light",
	P2: "p2_chrome_light",
	P3: "p3_heavy",
	P4: "p4_bulk"
});
const LANE_ORDER = Object.freeze([
	LANES.P0,
	LANES.P1,
	LANES.P2,
	LANES.P3,
	LANES.P4
]);

function laneForAction(action = "", kind = "") {
	const normalized = String(action || "");
	if (normalized === "retryAction" || normalized === "tunnelRequestPending") return LANES.P0;
	if (Control.CONTROL_ACTIONS.has(normalized)) return LANES.P0;
	if (Work.PAGE_ACTIONS.has(normalized)) return LANES.P0;
	if (Work.HISTORY_ACTIONS.has(normalized)) return LANES.P0;
	if (Work.WAIT_ACTIONS.has(normalized)) return LANES.P0;
	if (Control.DIAGNOSTIC_ACTIONS.has(normalized)) return LANES.P0;
	if (Work.BULK_ACTIONS.has(normalized) || /^mission|runtime|simulate|stress|bulk/i.test(normalized)) return LANES.P4;
	if (kind === "chrome" || /^chrome|browser/i.test(normalized)) {
		return Control.CHROME_LIGHT_ACTIONS.has(normalized) ? LANES.P2 : LANES.P3;
	}
	if (kind === "command" || /^command/.test(normalized)) return LANES.P3;
	if (kind === "fs" && Control.FS_LIGHT_ACTIONS.has(normalized)) return LANES.P1;
	if (kind === "fs") return LANES.P4;
	return LANES.P3;
}

function actionOf(item = {}) {
	return String(item.data?.payload?.action || item.payload?.action || item.action || "");
}

function kindOf(item = {}) {
	return String(item.data?.payload?.kind || item.payload?.kind || item.kind || "");
}

function laneOf(item = {}) {
	return laneForAction(actionOf(item), kindOf(item));
}

function isPriority(item = {}) {
	return laneOf(item) === LANES.P0;
}

module.exports = {
	LANES,
	LANE_ORDER,
	actionOf,
	isPriority,
	kindOf,
	laneForAction,
	laneOf
};
