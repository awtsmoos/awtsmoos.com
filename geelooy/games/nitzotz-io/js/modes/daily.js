// B"H

const DAILY_VARIANTS = [
	{ name: 'Avenue Day', trafficSpeed: 1.8, pedestrianSpeed: 1.25 },
	{ name: 'Fragile Day', fragile: true, captureMass: 1.22 },
	{ name: 'Celestial Day', celestial: true, eventCadence: 15, scoreScale: 1.25 },
	{ name: 'Rival Day', rivalSpeed: 1.42, bossAt: 0.5 }
];

export function dailyKey(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function dailySeed(baseSeed, date = new Date()) {
	return (baseSeed ^ hash(dailyKey(date))) >>> 0;
}

export function dailyVariant(date = new Date()) {
	return DAILY_VARIANTS[hash(dailyKey(date)) % DAILY_VARIANTS.length];
}

function hash(text) {
	let value = 2166136261;
	for (const character of text) {
		value ^= character.charCodeAt(0);
		value = Math.imul(value, 16777619);
	}
	return value >>> 0;
}
