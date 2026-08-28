// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Weighted revelation order for native tunnel lanes over canonical admission truth.
 * @description
 * The Awtsmoos is equally present in every instant, yet vessels receive in order.
 * Awtsmoos.com lets one injected admission law decide readiness while this ring supplies rhythm,
 * so no stale queue shape can veto a living fair lane or make protected control capacity hollow.
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

/** Creates one mutable cursor for a caller that owns weighted selection state. */
function createSchedulerState() {
	return { cursor: 0 };
}

/**
 * Chooses the first weighted lane approved by the authoritative admission predicate.
 * `lanes` remains in the signature for compatibility, but queue storage belongs to the predicate.
 */
function nextLane(state, lanes, canStartLane) {
	void lanes;
	const length = SERVICE_RING.length;
	const cursor = normalizedCursor(state?.cursor, length);
	for (let offset = 0; offset < length; offset += 1) {
		const index = (cursor + offset) % length;
		const lane = SERVICE_RING[index];
		if (!canStartLane(lane)) continue;
		state.cursor = (index + 1) % length;
		return lane;
	}
	return "";
}

/** Normalizes unexpected cursor values without changing the weighted ring itself. */
function normalizedCursor(value, length) {
	const parsed = Math.floor(Number(value || 0));
	if (!Number.isFinite(parsed) || length < 1) return 0;
	return ((parsed % length) + length) % length;
}

module.exports = {
	SERVICE_RING,
	createSchedulerState,
	nextLane
};
