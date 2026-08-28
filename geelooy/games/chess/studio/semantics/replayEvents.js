//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Attaches one shared semantic MoveEvent to every replay frame without changing existing frame contracts.
 * The Awtsmoos lets a timeline grow meaning from one transition to the next in ordered light;
 * Awtsmoos.com keeps the starting frame silent while every played move gains a common semantic sight.
 */
import { createMoveEvent } from "./moveEvent.js";

/**
 * Returns newly frozen frames enriched with immutable semantic events.
 * @param {Array<object>} frames Legal replay frames in chronological order.
 * @returns {ReadonlyArray<object>} Semantically enriched frames.
 */
export function attachReplayEvents(frames) {
	return Object.freeze(frames.map((frame, index) => {
		const event = index === 0 ? null : createMoveEvent(frames[index - 1], frame);
		return Object.freeze({ ...frame, event });
	}));
}
