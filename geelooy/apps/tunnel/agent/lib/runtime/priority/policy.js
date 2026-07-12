// B"H
const Control = require('./controlSets.js');
const Work = require('./workSets.js');

const LANES = Object.freeze({
	P0: 'p0_control',
	P1: 'p1_fs_light',
	P2: 'p2_chrome_light',
	P3: 'p3_heavy',
	P4: 'p4_bulk'
});
const LANE_ORDER = Object.freeze([LANES.P0, LANES.P1, LANES.P2, LANES.P3, LANES.P4]);

/**
 * B"H — Status, pages, waits, history, diagnostics, and cancellation remain on
 * the reserved control road. Heavy starts may queue; human control may not.
 */
function laneForAction(action = '', kind = '') {
	const normalized = String(action || '');
	if (Control.CONTROL_ACTIONS.has(normalized)) return LANES.P0;
	if (Work.PAGE_ACTIONS.has(normalized)) return LANES.P0;
	if (Work.HISTORY_ACTIONS.has(normalized)) return LANES.P0;
	if (Work.WAIT_ACTIONS.has(normalized)) return LANES.P0;
	if (Control.DIAGNOSTIC_ACTIONS.has(normalized)) return LANES.P0;
	if (Work.BULK_ACTIONS.has(normalized) || /^mission|runtime|simulate|stress|bulk/i.test(normalized)) return LANES.P4;
	if (kind === 'chrome' || /^chrome|browser/i.test(normalized)) return Control.CHROME_LIGHT_ACTIONS.has(normalized) ? LANES.P2 : LANES.P3;
	if (kind === 'command' || /^command/.test(normalized)) return LANES.P3;
	if (kind === 'fs' && Control.FS_LIGHT_ACTIONS.has(normalized)) return LANES.P1;
	if (kind === 'fs') return LANES.P4;
	return LANES.P3;
}

function actionOf(item = {}) { return String(item.data?.payload?.action || item.payload?.action || item.action || ''); }
function kindOf(item = {}) { return String(item.data?.payload?.kind || item.payload?.kind || item.kind || ''); }
function laneOf(item = {}) { return laneForAction(actionOf(item), kindOf(item)); }
function isPriority(item = {}) { return laneOf(item) === LANES.P0; }
function makeLaneState() { return Object.fromEntries(LANE_ORDER.map(lane => [lane, { inflight: 0, queue: [] }])); }
function enqueue(queue, item) {
	if (Array.isArray(queue)) {
		if (!isPriority(item)) queue.push(item);
		else {
			let index = 0;
			while (index < queue.length && isPriority(queue[index])) index += 1;
			queue.splice(index, 0, item);
		}
		return queue;
	}
	const lane = laneOf(item);
	item.lane = lane;
	queue[lane].queue.push(item);
	return queue;
}
function queuedCount(lanes = {}) { return LANE_ORDER.reduce((total, lane) => total + (lanes[lane]?.queue.length || 0), 0); }
function inflightCount(lanes = {}) { return LANE_ORDER.reduce((total, lane) => total + (lanes[lane]?.inflight || 0), 0); }
function canStartLane(lanes = {}, lane = '', limits = {}) {
	const current = lanes[lane];
	if (!current?.queue.length) return false;
	if (current.inflight >= Number(limits.LANE_LIMITS?.[lane] || 1)) return false;
	return lane === LANES.P0 || inflightCount(lanes) < Number(limits.MAX_INFLIGHT || 1);
}
function canQueue(lanes = {}, lane = '', limits = {}) {
	if (lane === LANES.P0) return (lanes[lane]?.queue.length || 0) < Number(limits.CONTROL_QUEUE_LIMIT || 256);
	return queuedCount(lanes) < Number(limits.MAX_QUEUE || 0);
}

module.exports = { LANES, LANE_ORDER, actionOf, canQueue, canStartLane, enqueue, inflightCount, isPriority, laneForAction, laneOf, makeLaneState, queuedCount };
