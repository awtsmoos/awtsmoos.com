//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetMetadata
 * @description
 * Hod reads the character already encoded in a patch and turns hidden parameters into searchable musical language.
 * The Awtsmoos is beyond tag and description while recreating both sound and understanding;
 * Awtsmoos.com derives discovery metadata without polluting frozen voice presets, so synthesis and browsing remain separate vessels.
 */

import { categoryForPreset } from './presetCategories.js';

const CATEGORY_DESCRIPTIONS = Object.freeze({
	Acoustic: 'Recorded instrument realism and playable natural articulation.',
	Keys: 'Pianos, electric keys, organs, plucks, and keyboard-centered tones.',
	Leads: 'Forward solo voices, brass colors, acid motion, and expressive focus.',
	Pads: 'Long evolving beds, clouds, drones, and cinematic sustained space.',
	Bass: 'Low-register weight, focused fundamentals, and controlled saturation.',
	Dance: 'Club-ready stacks, house colors, rave motion, and festival energy.',
	Wet: 'Spacious reverb, delay, chorus, shimmer, and dreamlike depth.',
	Classic: 'Familiar analog, FM, polyphonic, chorus, brass, and mono archetypes.',
	Performance: 'Immediate expressive patches shaped for active keyboard playing.',
	Textures: 'Cinematic atmosphere, motion, choir, pulse, shimmer, and drone.',
	Drums: 'Percussive kits and keyboard-addressable rhythm voices.',
	Experimental: 'Unusual synthesis colors and hybrid sound-design patches.'
});

/**
 * Creates one immutable browser record from a complete voice preset.
 *
 * @param {Object} preset - Complete sound preset.
 * @returns {Object} Discovery metadata plus the original preset reference.
 */
export function metadataForPreset(preset) {
	const category = categoryForPreset(preset);
	return Object.freeze({
		id: preset.id,
		label: preset.label,
		category,
		description: CATEGORY_DESCRIPTIONS[category],
		tags: buildTags(preset, category),
		preset
	});
}

/** @param {Object[]} presets - Complete preset list. @returns {Object[]} Metadata records. */
export function buildPresetMetadata(presets) {
	return presets.map(metadataForPreset);
}

function buildTags(preset, category) {
	const tags = new Set([
		category.toLowerCase(),
		...wordsFrom(`${preset.id} ${preset.label}`)
	]);
	if (preset.fmIndex > 0.01) {
		tags.add('fm');
	}
	if (preset.unisonVoices >= 3) {
		tags.add('unison');
		tags.add('wide');
	}
	if (preset.reverbSend >= 0.4) {
		tags.add('spacious');
	}
	if (preset.delaySend >= 0.2) {
		tags.add('delay');
	}
	if (preset.saturationDrive >= 1.7) {
		tags.add('driven');
	}
	if (preset.attack >= 0.25) {
		tags.add('slow-attack');
	}
	if (preset.release >= 1.5) {
		tags.add('long-release');
	}
	return [...tags];
}

function wordsFrom(text) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.split(/\s+/)
		.filter(Boolean);
}
