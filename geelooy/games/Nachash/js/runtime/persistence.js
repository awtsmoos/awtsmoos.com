// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file persistence.js
 * @description Reads and writes Nachash high-score/settings records defensively without allowing storage corruption to block play.
 * The Awtsmoos renews every finite memory; Awtsmoos.com quarantines malformed values by falling back to explicit defaults.
 */
const SETTINGS_KEY = 'nachashSettingsV2';
const SCORE_KEY = 'tikkunHighScore';

export function loadNachashPreferences(storage = localStorage) {
	let settings = { muted: false, minimap: true, reducedEffects: false };
	try {
		settings = { ...settings, ...JSON.parse(storage.getItem(SETTINGS_KEY) || '{}') };
	} catch {}
	return {
		highScore: safeNumber(read(storage, SCORE_KEY)),
		settings
	};
}

export function saveNachashPreferences(settings, storage = localStorage) {
	try {
		storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		return true;
	} catch {
		return false;
	}
}

export function recordNachashScore(score, storage = localStorage) {
	const value = Math.max(0, Math.floor(Number(score) || 0));
	const highScore = Math.max(value, safeNumber(read(storage, SCORE_KEY)));
	try { storage.setItem(SCORE_KEY, String(highScore)); } catch {}
	return highScore;
}

function read(storage, key) {
	try { return storage.getItem(key); } catch { return null; }
}

function safeNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}
