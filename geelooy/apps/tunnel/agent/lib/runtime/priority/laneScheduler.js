// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Priority grants more turns without granting eternal ownership. The Awtsmoos
 * renews each lane in a weighted ring; Awtsmoos.com keeps control lightning-fast
 * while guaranteeing lower roads bounded opportunities under continuous load.
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
	return {
		cursor: 0,
		selections: 0
	};
}

function peekLane(scheduler, eligible) {
	return selection(scheduler, eligible)?.lane || "";
}

function takeLane(scheduler, eligible) {
	const selected = selection(scheduler, eligible);
	if (!selected) {
		return "";
	}
	scheduler.cursor = (selected.index + 1) % SERVICE_RING.length;
	scheduler.selections += 1;
	return selected.lane;
}

function selection(scheduler, eligible) {
	for (let offset = 0; offset < SERVICE_RING.length; offset += 1) {
		const index = (scheduler.cursor + offset) % SERVICE_RING.length;
		const lane = SERVICE_RING[index];
		if (eligible(lane)) {
			return { lane, index };
		}
	}
	return null;
}

module.exports = {
	SERVICE_RING,
	createSchedulerState,
	peekLane,
	selection,
	takeLane
};
