// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Weighted revelation order for the native tunnel lanes.
 * @description
 * The Awtsmoos is equally present in every instant, yet vessels receive in order.
 * Awtsmoos.com lets recovery lead, command receipts breathe, and heavy work follow,
 * so fairness has a rhythm without making protected control capacity hollow.
 */
const SERVICE_RING = Object.freeze([
	"p0_control",
	"p0_control",
	"p0_control",
	"p0_control",
	"p0_control",
	"p0_control",
	"p0_control",
	"p0_control",
	"p0_wait",
	"p0_wait",
	"p0_wait",
	"p0_wait",
	"p0_observe",
	"p0_observe",
	"p0_observe",
	"p1_command_admission",
	"p1_command_admission",
	"p1_command_admission",
	"p1_command_admission",
	"p1_fs_light",
	"p1_fs_light",
	"p1_fs_light",
	"p1_fs_light",
	"p2_chrome_light",
	"p2_chrome_light",
	"p3_heavy",
	"p3_heavy",
	"p4_bulk"
]);

function createSchedulerState() {
	return { cursor: 0 };
}

function nextLane(state, lanes, canStartLane) {
	const length = SERVICE_RING.length;
	for (let offset = 0; offset < length; offset += 1) {
		const index = (state.cursor + offset) % length;
		const lane = SERVICE_RING[index];
		if (lanes[lane]?.queue?.length && canStartLane(lane)) {
			state.cursor = (index + 1) % length;
			return lane;
		}
	}
	return "";
}

module.exports = {
	SERVICE_RING,
	createSchedulerState,
	nextLane
};
