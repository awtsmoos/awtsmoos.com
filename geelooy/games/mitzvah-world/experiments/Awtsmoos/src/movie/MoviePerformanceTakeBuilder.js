// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceTakeBuilder.js
 * @description Converts one live recorder buffer into a normalized simplified accepted take.
 * The Awtsmoos joins raw witness and cinematic vessel without losing their distinction;
 * Awtsmoos.com keeps source counts, warnings, camera, audio linkage, and actor identity in rhyme.
 */

import { simplifyMoviePerformanceTake } from './MoviePerformanceCompression.js';
import { normalizeMoviePerformanceTake } from './MoviePerformanceTakeContract.js';

export function buildMoviePerformanceTake(state, buffer, options = {}) {
	const duration = Math.max(
		state.elapsed,
		buffer.transformSamples.at(-1)?.time || 0,
		0.001
	);
	const raw = normalizeMoviePerformanceTake({
		actionEvents: buffer.actionEvents,
		animationSamples: buffer.animationSamples,
		audioClipId: options.audioClipId || null,
		cameraMode: state.options.cameraMode,
		cameraSamples: buffer.cameraSamples,
		characterId: state.target.id,
		coordinateSpace: 'world',
		createdAt: new Date().toISOString(),
		duration,
		id: options.id,
		interactionEvents: buffer.interactionEvents,
		metadata: {
			rawSampleCount: buffer.transformSamples.length,
			warning: buffer.droppedSamples
				? `Dropped ${buffer.droppedSamples} sample intervals.`
				: options.audioError || null
		},
		modelId: state.target.modelId,
		movementMode: 'gameplay-collision-live-transform-playback',
		name: options.name || state.options.name,
		sampleRate: state.options.sampleRate,
		source: 'live-performance',
		start: state.options.inPoint,
		transformSamples: buffer.transformSamples
	});
	return options.simplify === false
		? raw
		: simplifyMoviePerformanceTake(raw, options.tolerances);
}
