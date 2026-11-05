// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelinePerformanceSummary.js
 * @description Derives performer, take, motion, action, camera, audio, preference, and warning truth.
 * The Awtsmoos is beyond every curve while finite editors require visible evidence; Awtsmoos.com
 * turns recorded body, facing, deed, voice, lens, and warning into one deterministic NLE rhyme.
 */

import { vectorDistance } from './MoviePerformanceSamples.js';

export function summarizeMovieTimelinePerformance(project, track, clip) {
	const take = project.performance?.takes?.find(item => item.id === clip.takeId);
	const performer = project.performance?.performers?.find(item => (
		item.id === (take?.characterId || track.target)
	));
	if (!take) {
		return missingSummary(track, clip, performer);
	}
	const movement = movementSummary(take.transformSamples);
	const warnings = warningList(track, clip, take);
	return {
		actionCount: take.actionEvents.length + take.interactionEvents.length,
		actionMarkers: markers(take.actionEvents, take.duration),
		animationMarkers: markers(take.animationSamples, take.duration),
		audio: Boolean(take.audioClipId),
		camera: Boolean(take.cameraSamples.length),
		cameraMarkers: markers(take.cameraSamples, take.duration),
		facingPoints: facingPoints(take.transformSamples, take.duration),
		label: `${performer?.name || take.characterId} · ${take.name}`,
		movement,
		performer: performer?.name || take.characterId,
		preferred: performer?.preferredTakeId === take.id,
		speedPoints: speedPoints(take.transformSamples, take.duration),
		take,
		warnings
	};
}

function movementSummary(samples = []) {
	let distance = 0;
	let maximumSpeed = 0;
	const states = new Set();
	for (let index = 0; index < samples.length; index += 1) {
		const sample = samples[index];
		states.add(sample.movementState);
		maximumSpeed = Math.max(maximumSpeed, Math.hypot(...sample.velocity));
		if (index) {
			distance += vectorDistance(samples[index - 1].position, sample.position);
		}
	}
	return {
		distance,
		maximumSpeed,
		states: [...states].filter(Boolean)
	};
}

function speedPoints(samples, duration) {
	const maximum = Math.max(0.001, ...samples.map(sample => Math.hypot(...sample.velocity)));
	return samples.map(sample => [
		percentage(sample.time, duration),
		100 - Math.hypot(...sample.velocity) / maximum * 100
	]);
}

function facingPoints(samples, duration) {
	return samples.map(sample => [
		percentage(sample.time, duration),
		50 - Math.sin(sample.rotation[1] || 0) * 42
	]);
}

function markers(values = [], duration) {
	return values.slice(0, 120).map(value => percentage(value.time, duration));
}

function percentage(time, duration) {
	return Math.max(0, Math.min(100, Number(time || 0) / Math.max(0.001, duration) * 100));
}

function warningList(track, clip, take) {
	const warnings = [];
	if (!take.transformSamples.length) warnings.push('No movement samples');
	if (take.characterId !== track.target) warnings.push('Character mismatch');
	if (clip.reverse && (take.actionEvents.length || take.interactionEvents.length)) {
		warnings.push('Reverse action semantics unsafe');
	}
	if (take.metadata?.warning) warnings.push(take.metadata.warning);
	return warnings;
}

function missingSummary(track, clip, performer) {
	return {
		actionCount: 0,
		actionMarkers: [],
		animationMarkers: [],
		audio: false,
		camera: false,
		cameraMarkers: [],
		facingPoints: [],
		label: `${performer?.name || track.target || 'Performer'} · Missing take`,
		movement: { distance: 0, maximumSpeed: 0, states: [] },
		performer: performer?.name || track.target,
		preferred: false,
		speedPoints: [],
		take: null,
		warnings: [`Missing take ${clip.takeId}`]
	};
}
