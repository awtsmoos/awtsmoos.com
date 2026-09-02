//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongRemixArrangements
 * @description
 * Netzach knows return, Hod knows restraint, and Tiferes orders repetition so the drop can answer the build.
 * The Awtsmoos is beyond every arrangement while Awtsmoos.com keeps each remix recipe explicit, editable, and reproducible.
 */

export const REMIX_STYLES = Object.freeze([
	{ id: 'festival', label: 'Festival Build + Drop' },
	{ id: 'echo-repeat', label: 'Echo Repeats' },
	{ id: 'cut-stutter', label: 'Cut + Stutter' },
	{ id: 'ratchet-drop', label: 'Ratchet Collapse + Drop' }
]);

/** Builds descriptors for one remix style. @param {string} style Style id. @param {Object[]} sections Source sections. @param {Object} strongest Densest section. @returns {Object[]} Arrangement descriptors. */
export function createRemixArrangement(style, sections, strongest) {
	const first = sections[0];
	const second = sections[1] || first;
	if (style === 'echo-repeat') {
		return echoRepeat(first, second, strongest);
	}
	if (style === 'cut-stutter') {
		return cutStutter(first, strongest);
	}
	if (style === 'ratchet-drop') {
		return ratchetDrop(first, second, strongest);
	}
	return festival(first, second, strongest);
}

/** Returns one human style label. @param {string} id Style id. @returns {string} Display label. */
export function remixStyleLabel(id) {
	return REMIX_STYLES.find((style) => style.id === id)?.label || id;
}

function festival(first, second, strongest) {
	return [
		section(first, 'INTRO', { sparse: 0.48, velocity: 0.72 }),
		section(second, 'BUILD', { sparse: 0.18, velocity: 0.9 }),
		section(strongest, 'DROP', { velocity: 1.1, restBefore: first.length / 4 }),
		section(strongest, 'DROP REPEAT', { velocity: 1.05 }),
		section(first, 'BREAK', { sparse: 0.58, velocity: 0.7 }),
		section(strongest, 'FINAL DROP', { velocity: 1.12 })
	];
}

function echoRepeat(first, second, strongest) {
	return [
		section(first, 'INTRO'),
		section(second, 'VERSE'),
		section(second, 'REPEAT', { velocity: 0.82 }),
		section(strongest, 'WIDE REPEAT', { velocity: 1.05 }),
		section(strongest, 'FINAL', { velocity: 1.08 })
	];
}

function cutStutter(first, strongest) {
	return [
		section(first, 'CUT INTRO', { sparse: 0.38 }),
		section(strongest, 'STUTTER A', { sparse: 0.22 }),
		section(strongest, 'STUTTER B', { sparse: 0.12 }),
		section(strongest, 'DROP', { velocity: 1.1, restBefore: first.length / 4 })
	];
}

function ratchetDrop(first, second, strongest) {
	return [
		section(first, 'INTRO', { sparse: 0.5, velocity: 0.74 }),
		section(second, 'BUILD', { velocity: 0.9 }),
		section(strongest, 'RATCHET BUILD', { ratchet: true, velocity: 1.02 }),
		section(strongest, 'DROP', { velocity: 1.12 }),
		section(strongest, 'FINAL DROP', { velocity: 1.14 })
	];
}

function section(source, label, options = {}) {
	return { section: source, label, ...options };
}
