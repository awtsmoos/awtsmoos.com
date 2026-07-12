// B"H
const KEY = 'nitzotz-holeio-save-v2';

/** Load durable progression while deeply upgrading every older save shape. */
export function loadSave() {
	try {
		return normalize(JSON.parse(localStorage.getItem(KEY) || '{}'));
	} catch {
		return defaults();
	}
}

export function saveGame(save) {
	try {
		localStorage.setItem(KEY, JSON.stringify(save));
	} catch {}
}

export function defaults() {
	return {
		best: 0,
		bestMass: 0,
		stars: {},
		unlocked: 0,
		currentLevel: 0,
		selectedMode: 'classic',
		modeRecords: {},
		achievements: {},
		daily: {},
		collection: {},
		perf: 'high',
		haptics: true,
		postfx: true,
		uiScale: 1
	};
}

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

function normalize(raw) {
	const base = defaults();
	return {
		...base,
		...raw,
		stars: { ...base.stars, ...(raw.stars || {}) },
		modeRecords: { ...base.modeRecords, ...(raw.modeRecords || {}) },
		achievements: { ...base.achievements, ...(raw.achievements || {}) },
		daily: { ...base.daily, ...(raw.daily || {}) },
		collection: { ...base.collection, ...(raw.collection || {}) }
	};
}
