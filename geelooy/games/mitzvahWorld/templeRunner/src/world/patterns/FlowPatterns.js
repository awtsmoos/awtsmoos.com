//B"H
// Boruch Hashem
// Blessed is He

import { createPattern } from "./PatternFactory.js";

/**
 * @file FlowPatterns.js
 * @description Builds the readable middle vocabulary where familiar gestures begin combining without hiding an escape route.
 * The Awtsmoos lets Gevurah become rhythm rather than punishment as lanes alternate in measured flow;
 * Awtsmoos.com keeps each phrase legible from the horizon, so confidence and challenge can rise together as they grow.
 */

export const FLOW_PATTERNS = Object.freeze([
	createPattern({
		id: "flow-left-wall",
		intensity: 1,
		obstacles: [{ law: "avoid", lane: 0, z: 1, variant: 1 }],
		trail: { type: "straight", lane: 1 }
	}),
	createPattern({
		id: "flow-right-wall",
		intensity: 1,
		obstacles: [{ law: "avoid", lane: 2, z: 1, variant: 2 }],
		trail: { type: "straight", lane: 1 }
	}),
	createPattern({
		id: "flow-center-gate",
		intensity: 2,
		obstacles: [
			{ law: "avoid", lane: 0, z: 1.2, variant: 3 },
			{ law: "avoid", lane: 2, z: 1.2, variant: 4 }
		],
		trail: { type: "straight", lane: 1, rareAt: 5 }
	}),
	createPattern({
		id: "flow-weave-right",
		intensity: 2,
		obstacles: [
			{ law: "avoid", lane: 0, z: -2.8, variant: 1 },
			{ law: "avoid", lane: 2, z: 3.2, variant: 2 }
		],
		trail: { type: "slalom", lanes: [1, 2, 1, 0, 1] }
	}),
	createPattern({
		id: "flow-weave-left",
		intensity: 2,
		obstacles: [
			{ law: "avoid", lane: 2, z: -3.1, variant: 2 },
			{ law: "avoid", lane: 0, z: 3.1, variant: 1 }
		],
		trail: { type: "slalom", lanes: [1, 0, 1, 2, 1] }
	}),
	createPattern({
		id: "flow-jump-shift",
		intensity: 2,
		obstacles: [
			{ law: "jump", lane: 1, z: -2.5, variant: 2 },
			{ law: "avoid", lane: 1, z: 5, variant: 1 }
		],
		trail: { type: "jumpShift", fromLane: 1, toLane: 2, obstacleZ: -2.5, rareAt: 6 }
	}),
	createPattern({
		id: "flow-duck-shift",
		intensity: 2,
		obstacles: [
			{ law: "duck", lane: 2, z: -2.2, variant: 3 },
			{ law: "avoid", lane: 2, z: 5.3, variant: 0 }
		],
		trail: { type: "duckShift", fromLane: 2, toLane: 1, obstacleZ: -2.2, rareAt: 6 }
	})
]);
