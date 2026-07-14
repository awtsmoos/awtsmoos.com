// B"H
// Boruch Hashem
// Blessed is He
import {
	createDefaultSave,
	normalizeSave,
	sanitizeRoom
} from './save/schema.js';

const KEY = 'nitzotz-holeio-save-v2';

/** Load and normalize the durable campaign covenant from local storage. */
export function loadSave() {
	try {
		const raw = typeof localStorage === 'undefined'
			? {}
			: JSON.parse(localStorage.getItem(KEY) || '{}');
		return normalizeSave(raw);
	} catch {
		return defaults();
	}
}

/** Persist the complete schema-four save without exposing storage failures. */
export function saveGame(save) {
	try {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(KEY, JSON.stringify(normalizeSave(save)));
		}
	} catch {}
}

/** Return one fresh default save vessel. */
export function defaults() {
	return createDefaultSave();
}

export { normalizeSave, sanitizeRoom };

export function perfLabel(perf) {
	return ({ low: 'Smooth', medium: 'Balanced', high: 'Extreme' })[perf] || 'Balanced';
}

export function objectBudget(perf) {
	return ({ low: 260, medium: 430, high: 640 })[perf] || 430;
}

export function streamRadius() {
	return 0;
}

export function pressureFor() {
	return 1;
}
