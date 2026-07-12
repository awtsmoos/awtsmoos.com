// B"H
import { dist } from '../math.js';

/** Locked boss cores remain visible but cannot begin capture. */
export function canConsumeObject(hole, object) {
	return !object.taken && !object.sinkOwner && !object.locked && object.r <= hole.r * 0.72;
}

export function insideCapture(hole, object) {
	return dist(hole, object) < Math.max(5, hole.r - object.r * 0.28);
}

export function canConsumeHole(big, small) {
	return big.respawn <= 0 && small.respawn <= 0 && big.grace <= 0 && small.grace <= 0 && big.r > small.r * 1.22;
}
