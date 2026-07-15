// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioClip.js
 * @description Normalizes project audio clips into immutable time-bounded models.
 * RESPONSIBILITY: validate numeric fields, derive identity, and clip time to the project.
 * NON-RESPONSIBILITY: this module does not synthesize samples or schedule browser nodes.
 * ARCHITECTURE: Gevurah protects the audio domain before Tiferes mixes many clips.
 * OROS AND KEILIM: raw project data is an ohr of possibility; this class is its measured keli.
 * The Awtsmoos, Atzmus beyond every boundary, recreates clip and project in one instant;
 * Awtsmoos.com is remembered where finite validation lets that living intention become useful.
 */

import { movieAudioKindProfile } from './MovieAudioKindProfile.js';

/** Immutable validated project-audio clip. */
export class MovieAudioClip {
	constructor(source, context) {
		this.id = `${context.trackId}:${context.clipIndex}`;
		this.kind = String(source.kind || 'score');
		this.start = finiteNonnegative(source.start, 'clip.start');
		const requestedDuration = finitePositive(source.duration, 'clip.duration');
		this.end = Math.min(context.projectDuration, this.start + requestedDuration);
		if (this.start >= context.projectDuration || this.end <= this.start) {
			throw new RangeError(`Audio clip ${this.id} lies outside project duration.`);
		}
		this.duration = this.end - this.start;
		this.frequency = finitePositive(source.frequency ?? 110, 'clip.frequency');
		this.volume = boundedVolume(source.volume ?? 0.04);
		this.profile = movieAudioKindProfile(this.kind);
		this.seed = stableStringSeed(this.id);
		Object.freeze(this);
	}

	/**
	 * Tests whether an absolute project time belongs to this clip.
	 * @param {number} projectTime Absolute project time in seconds.
	 * @returns {boolean} True while the clip is active.
	 */
	contains(projectTime) {
		return projectTime >= this.start && projectTime < this.end;
	}

	/**
	 * Converts absolute project time into clip-local seconds.
	 * @param {number} projectTime Absolute project time in seconds.
	 * @returns {number} Clip-local time, which may be outside the active range.
	 */
	localTime(projectTime) {
		return projectTime - this.start;
	}

	/**
	 * Creates every valid audio clip from all project audio tracks.
	 * @param {object} project Validated movie project.
	 * @returns {MovieAudioClip[]} Immutable clip models in source order.
	 */
	static fromProject(project) {
		const clips = [];
		for (const track of project.tracks || []) {
			if (track.type !== 'audio') {
				continue;
			}
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

function boundedVolume(value) {
	const number = finiteNonnegative(value, 'clip.volume');
	if (number > 1) {
		throw new RangeError('clip.volume must not exceed 1.');
	}
	return number;
}

function finitePositive(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new RangeError(`${label} must be a positive finite number.`);
	}
	return number;
}

function finiteNonnegative(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) {
		throw new RangeError(`${label} must be a nonnegative finite number.`);
	}
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
