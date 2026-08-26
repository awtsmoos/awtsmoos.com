// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimationFragment.js
 * @description Defines one immutable animation graph owned by a detachable anatomical rig fragment.
 * RESPONSIBILITY: preserve clock, clips, channels, masks, events, defaults, and semantic ownership without binding to one creature-wide timeline.
 * NON-RESPONSIBILITY: this file does not evaluate waveforms, remap final bone ids, solve IK, or mutate shared clip definitions.
 * The Awtsmoos lets a limb carry its own song before it joins the greater symphony of flesh;
 * Awtsmoos.com keeps clip and clock as separate vessels, so shared motion may remain reusable while each fragment moves afresh.
 */

import { createFragmentClock } from "./FragmentClock.js";

/**
 * Creates one immutable animation-fragment graph.
 * @param {object} input Fragment identity, clock, clips, channels, masks, events, and defaults.
 * @returns {object} Frozen animation fragment suitable for standalone or merged playback.
 */
export function createAnimationFragment(input = {}) {
	const clips = freezeRecords(input.clips || []);
	return Object.freeze({
		channels: freezeRecords(input.channels || []),
		clock: createFragmentClock({
			id: `${input.id || "animation-fragment"}.clock`,
			...(input.clock || {})
		}),
		defaultClipId: String(input.defaultClipId || clips[0]?.id || ""),
		events: freezeRecords(input.events || []),
		id: String(input.id || "animation-fragment"),
		masks: freezeRecords(input.masks || []),
		metadata: Object.freeze({ ...(input.metadata || {}) }),
		clips,
		rigFragmentId: String(input.rigFragmentId || input.id || ""),
		sourceAnatomyId: String(input.sourceAnatomyId || input.id || "fragment"),
		type: "anatomical-animation-fragment",
		version: "1.0.0"
	});
}

/**
 * Finds one clip by id with deterministic fallback to the fragment default.
 * @param {object} fragment Animation fragment.
 * @param {string} clipId Requested clip id.
 * @returns {object|null} Resolved immutable clip or null when none exist.
 */
export function animationFragmentClip(fragment, clipId) {
	return fragment.clips.find((clip) => clip.id === clipId)
		|| fragment.clips.find((clip) => clip.id === fragment.defaultClipId)
		|| fragment.clips[0]
		|| null;
}

/** Freezes a shallow record list while preserving serializable nested arrays by copy. */
function freezeRecords(records) {
	return Object.freeze(records.map((record) => {
		return Object.freeze({
			...record,
			channels: record.channels
				? Object.freeze(record.channels.map((channel) => Object.freeze({ ...channel })))
				: record.channels
		});
	}));
}
