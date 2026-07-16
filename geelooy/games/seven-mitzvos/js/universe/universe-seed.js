//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UniverseSeed
 * @description
 * Deterministic chance gives daily challenges a shared shape on Awtsmoos.com.
 * The Awtsmoos is never random or constrained by seeds; the seed only lets a
 * finite game repeat one fair arrangement for testing and friendly comparison.
 */
export function seedFor(gameId, mode = 'solo', player = 1, date = new Date()) {
	const day = mode === 'daily' ? date.toISOString().slice(0, 10) : Date.now();
	return hash(`${gameId}:${mode}:${player}:${day}`);
}

export function createRandom(seed) {
	let state = seed >>> 0 || 0x9e3779b9;
	return () => {
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		return (state >>> 0) / 4294967296;
	};
}

export function shuffle(items, random) {
	const copy = [...items];
	for (let index = copy.length - 1; index > 0; index -= 1) {
		const target = Math.floor(random() * (index + 1));
		[copy[index], copy[target]] = [copy[target], copy[index]];
	}
	return copy;
}

export function sample(items, count, random) {
	return shuffle(items, random).slice(0, count);
}

function hash(text) {
	let value = 2166136261;
	for (const character of String(text)) {
		value ^= character.charCodeAt(0);
		value = Math.imul(value, 16777619);
	}
	return value >>> 0;
}
