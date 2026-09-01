//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetCategories
 * @description
 * Binah gives a palace of forty-six sounds readable rooms while the Awtsmoos remains beyond every category and name.
 * Awtsmoos.com lets acoustic truth, wet space, classic synthesis, performance color, and texture stay discoverable,
 * so abundance becomes musical choice instead of one long flat selector where every lamp looks the same.
 */

export const PRESET_CATEGORIES = Object.freeze([
	'All',
	'Favorites',
	'Recent',
	'Acoustic',
	'Keys',
	'Leads',
	'Pads',
	'Bass',
	'Dance',
	'Wet',
	'Classic',
	'Performance',
	'Textures',
	'Drums',
	'Experimental'
]);

/**
 * Assigns one stable discovery category without mutating the sound preset itself.
 *
 * @param {Object} preset - Complete synthesis preset.
 * @returns {string} Browser category.
 */
export function categoryForPreset(preset) {
	const identity = `${preset.id} ${preset.label}`.toLowerCase();
	if (identity.includes('drum')) {
		return 'Drums';
	}
	if (preset.id.startsWith('real-')) {
		return 'Acoustic';
	}
	if (preset.id.startsWith('wet-')) {
		return 'Wet';
	}
	if (preset.id.startsWith('classic-')) {
		return 'Classic';
	}
	if (preset.id.startsWith('performance-')) {
		return 'Performance';
	}
	if (preset.id.startsWith('texture-')) {
		return 'Textures';
	}
	if (identity.includes('bass')) {
		return 'Bass';
	}
	if (containsAny(identity, [
		'piano',
		'rhodes',
		'wurli',
		'organ',
		'keys',
		'fm glass',
		'pluck'
	])) {
		return 'Keys';
	}
	if (containsAny(identity, [
		'lead',
		'brass',
		'sax',
		'acid',
		'screech'
	])) {
		return 'Leads';
	}
	if (containsAny(identity, [
		'trance',
		'future bass',
		'house',
		'rave',
		'festival'
	])) {
		return 'Dance';
	}
	if (containsAny(identity, [
		'cloud',
		'pad',
		'atmosphere',
		'drone',
		'choir'
	])) {
		return 'Pads';
	}
	return 'Experimental';
}

function containsAny(identity, terms) {
	return terms.some((term) => {
		return identity.includes(term);
	});
}
