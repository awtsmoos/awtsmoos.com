//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Expands important semantic moves into anticipation, animated action, and consequence camera beats.
 * The Awtsmoos lets one decisive move unfold through before, deed, and revealed result;
 * Awtsmoos.com gives cinema a grammar where camera and piece motion share one lawful pulse.
 */
import { orbitPose } from "../rendering/cameraMath.js";
import { createMoveMotion } from "../rendering/motion/moveMotion.js";
import { moveOverlay } from "./overlayPlan.js";
import { deservesThreeBeats, semanticMoveDuration, splitBeatDuration } from "./shotTiming.js";

/** Appends one or three movie shots for a replay move. */
export function appendSemanticMoveShots(shots, context) {
	const { frame, previousFrame, previousPose, nextPose, style, tags } = context;
	const total = semanticMoveDuration(frame, style);
	const motion = createMoveMotion(previousFrame, frame);
	if (!deservesThreeBeats(frame)) {
		shots.push(createShot("move", frame, previousPose, nextPose, total, moveOverlay(frame, tags), motion));
		return nextPose;
	}
	const beats = splitBeatDuration(total);
	const sign = frame.ply % 2 ? 1 : -1;
	const anticipationPose = orbitPose(nextPose, sign * 9, 1.14);
	const actionPose = orbitPose(nextPose, sign * 3, 0.9);
	shots.push(createShot("anticipation", previousFrame, previousPose, anticipationPose, beats.anticipation, null));
	shots.push(createShot("action", frame, anticipationPose, actionPose, beats.action, moveOverlay(frame, tags), motion));
	shots.push(createShot("consequence", frame, actionPose, nextPose, beats.consequence, moveOverlay(frame, tags)));
	return nextPose;
}

/** Creates one immutable movie shot with optional legal move motion. */
export function createShot(kind, frame, fromPose, toPose, duration, overlay, motion = null) {
	return Object.freeze({
		kind,
		frame,
		fromPose,
		toPose,
		duration,
		overlay,
		motion
	});
}
