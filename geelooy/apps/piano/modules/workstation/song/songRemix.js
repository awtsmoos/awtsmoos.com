//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongRemix
 * @description
 * Tiferes arranges builds, silences, returns, and drops while Gevurah can contract one fragment into a rushing ratchet.
 * The Awtsmoos remains beyond every version; Awtsmoos.com therefore keeps the source take untouched and makes the derived remix reproducible.
 */

import { createSong } from './songModel.js';
import { buildRatchetCollapse } from './songRatchet.js';
import {
	createRemixArrangement,
	remixStyleLabel
} from './songRemixArrangements.js';
import {
	buildSongSections,
	densestSection
} from './songSections.js';

/** Builds one deterministic remix from a canonical source song. @param {Object} song Source song. @param {Object} options Remix controls. @returns {Object} Derived canonical remix. */
export function buildSongRemix(song, options = {}) {
	const sections = buildSongSections(song, options.sectionBars || 4);
	const strongest = densestSection(sections) || sections[0];
	const style = options.style || 'festival';
	const descriptors = createRemixArrangement(style, sections, strongest);
	const random = seededRandom(options.seed ?? 1);
	const events = [];
	const markers = [];
	let cursor = 0;
	descriptors.forEach((descriptor) => {
		cursor += nonnegative(descriptor.restBefore, 0);
		markers.push({ beat: cursor, label: descriptor.label });
		cursor += descriptor.ratchet
			? appendRatchet(events, descriptor, cursor, options.ratchet || {})
			: appendSection(events, descriptor, cursor, random);
	});
	return createSong({
		...song,
		title: `${song.title || 'Song'} · ${remixStyleLabel(style)} Remix`,
		events,
		markers
	});
}

function appendSection(target, descriptor, cursor, random) {
	const source = descriptor.section;
	(source.events || []).forEach((event) => {
		if (descriptor.sparse && random() < descriptor.sparse) {
			return;
		}
		target.push({
			...event,
			start: cursor + event.start,
			velocity: clamp(event.velocity * (descriptor.velocity || 1), 0, 1)
		});
	});
	return source.length;
}

function appendRatchet(target, descriptor, cursor, overrides) {
	const source = descriptor.section;
	const earliest = earliestStart(source.events || []);
	const available = Math.max(1 / 32, source.length - earliest);
	const sliceLength = Math.min(positive(overrides.sliceLength, 1), available);
	const result = buildRatchetCollapse(source.events || [], {
		sliceStart: nonnegative(overrides.sliceStart, earliest),
		sliceLength,
		repetitions: positive(overrides.repetitions, 7),
		shortenRatio: overrides.shortenRatio ?? 0.5,
		minimumSlice: positive(overrides.minimumSlice, 1 / 32),
		velocityRamp: nonnegative(overrides.velocityRamp, 0.04),
		gate: overrides.gate ?? 0.75,
		gapAfter: nonnegative(overrides.gapAfter, 0.25)
	});
	result.events.forEach((event) => {
		target.push({
			...event,
			start: cursor + event.start,
			velocity: clamp(event.velocity * (descriptor.velocity || 1), 0, 1)
		});
	});
	return result.duration;
}

function earliestStart(events) {
	return events.length ? Math.min(...events.map((event) => event.start)) : 0;
}

function seededRandom(seed) {
	let state = [...String(seed)].reduce(
		(hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0,
		2166136261
	);
	return () => {
		state = ((1664525 * state) + 1013904223) >>> 0;
		return state / 4294967296;
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}
