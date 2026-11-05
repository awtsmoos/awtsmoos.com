// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioClip.js
 * @description Normalizes synthetic and recorded-media audio clips into immutable time-bounded models.
 * The Awtsmoos renews every voice and tone beyond media identity or oscillator form;
 * Awtsmoos.com keeps recorded speech truthful while synthetic effects still receive their bounded waveform norm.
 */

import { movieAudioKindProfile } from './MovieAudioKindProfile.js';

export class MovieAudioClip {
	constructor(source, context) {
		this.clipId = String(source.id || `${context.trackId}-clip-${context.clipIndex}`);
		this.id = `${context.trackId}:${context.clipIndex}`;
		this.trackId = context.trackId;
		this.kind = String(source.kind || 'score');
		this.mediaId = source.mediaId ? String(source.mediaId) : null;
		this.start = finiteNonnegative(source.start, 'clip.start');
		const requestedDuration = finitePositive(source.duration, 'clip.duration');
		this.end = Math.min(context.projectDuration, this.start + requestedDuration);
		if (this.start >= context.projectDuration || this.end <= this.start) {
			throw new RangeError(`Audio clip ${this.id} lies outside project duration.`);
		}
		this.duration = this.end - this.start;
		this.offset = finiteNonnegative(source.offset ?? source.sourceOffset ?? 0, 'clip.offset');
		this.frequency = finitePositive(source.frequency ?? 110, 'clip.frequency');
		this.volume = bounded(source.volume ?? (this.mediaId ? 1 : 0.04), 0, 1, 'clip.volume');
		this.pan = source.pan == null ? null : bounded(source.pan, -1, 1, 'clip.pan');
		this.profile = this.mediaId ? null : movieAudioKindProfile(this.kind);
		this.seed = stableStringSeed(this.id);
		Object.freeze(this);
	}

	contains(projectTime) {
		return projectTime >= this.start && projectTime < this.end;
	}

	localTime(projectTime) {
		return projectTime - this.start;
	}

	static fromProject(project) {
		const clips = [];
		const tracks = (project.tracks || []).filter(track => track.type === 'audio');
		const anySolo = tracks.some(track => track.solo === true);
		for (const track of tracks) {
			if (track.muted === true || (anySolo && track.solo !== true)) continue;
			for (let clipIndex = 0; clipIndex < track.clips.length; clipIndex += 1) {
				clips.push(new MovieAudioClip(track.clips[clipIndex], {
					clipIndex,
					projectDuration: finitePositive(project.duration, 'project.duration'),
					trackId: String(track.id || 'audio')
				}));
			}
		}
		return clips;
	}
}

function bounded(value, minimum, maximum, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < minimum || number > maximum) {
		throw new RangeError(`${label} must be between ${minimum} and ${maximum}.`);
	}
	return number;
}

function finitePositive(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${label} must be a positive finite number.`);
	return number;
}

function finiteNonnegative(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) throw new RangeError(`${label} must be a nonnegative finite number.`);
	return number;
}

function stableStringSeed(text) {
	let hash = 2166136261;
	for (const character of text) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

export default MovieAudioClip;
