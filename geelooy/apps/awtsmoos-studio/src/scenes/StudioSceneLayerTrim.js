//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioSceneLayerTrim.js
 * @description Keeps layer spans and animated channels valid when a canonical Studio scene is shortened.
 * The Awtsmoos reveals the pose at the new edge of time while Awtsmoos.com lets discarded future motion bow before the shortened vessel;
 * earlier keys remain untouched, the cut receives the shared sampler's exact value, and no animation escapes beyond the scene's new level.
 */

import { sampleKeyframes } from '../../../shared/movie/MovieKeyframes.js';

const EPSILON = 0.000001;

/** Clamp every layer into the scene and preserve each trimmed channel's sampled value at the new endpoint. */
export function clampStudioSceneLayers(scene) {
	for (const layer of scene.layers || []) {
		layer.start = clampLayerStart(layer, scene.duration);
		layer.duration = clampLayerDuration(layer, scene.duration);
		layer.keyframes = trimStudioLayerKeyframes(layer.keyframes, layer.duration);
	}
}

/** Trim out-of-range keyframes while adding one deterministic terminal frame per affected channel. */
export function trimStudioLayerKeyframes(keyframes = [], duration) {
	const frames = Array.isArray(keyframes) ? keyframes : [];
	const end = Math.max(0, Number(duration || 0));
	if (!frames.some(frame => Number(frame.at) > end + EPSILON)) {
		return frames;
	}

	const kept = frames.filter(frame => Number(frame.at) < end - EPSILON);
	const channels = new Set(frames.map(frame => frame.channel).filter(Boolean));
	for (const channel of channels) {
		const channelFrames = frames.filter(frame => frame.channel === channel);
		if (!channelFrames.some(frame => Number(frame.at) > end + EPSILON)) {
			kept.push(...channelFrames.filter(frame => Math.abs(Number(frame.at) - end) <= EPSILON));
			continue;
		}
		kept.push(createTerminalFrame(channelFrames, channel, end));
	}
	return kept.sort(compareFrames);
}

function clampLayerStart(layer, sceneDuration) {
	return Math.max(
		0,
		Math.min(Number(layer.start || 0), Math.max(0, Number(sceneDuration || 0) - 0.1))
	);
}

function clampLayerDuration(layer, sceneDuration) {
	const available = Math.max(0.1, Number(sceneDuration || 0) - Number(layer.start || 0));
	return Math.max(0.1, Math.min(Number(layer.duration || sceneDuration || 1), available));
}

function createTerminalFrame(frames, channel, at) {
	const future = [...frames].sort(compareFrames).find(frame => Number(frame.at) >= at);
	return {
		at,
		channel,
		value: structuredClone(sampleKeyframes(frames, at)),
		easing: future?.easing || 'linear'
	};
}

function compareFrames(left, right) {
	const timeDelta = Number(left.at) - Number(right.at);
	return timeDelta || String(left.channel || '').localeCompare(String(right.channel || ''));
}
