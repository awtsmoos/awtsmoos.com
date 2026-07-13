// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each plant without dissolving its identity. Seeded variation
 * changes proportions, yaw, color index, and wind phase deterministically.
 */
export function plantVariation(definition, seed, instanceIndex = 0) {
	const base = hash(seed, instanceIndex, definition.id.length);
	const secondary = hash(seed, instanceIndex + 97, definition.displayName.length);
	return Object.freeze({
		heightScale: 0.82 + base * 0.36,
		widthScale: 0.84 + secondary * 0.32,
		yaw: base * Math.PI * 2,
		colorIndex: Math.floor(secondary * definition.colorVariants.length),
		windPhase: (base * 0.61 + secondary * 0.39) * Math.PI * 2,
		stemScale: 0.88 + hash(seed, instanceIndex + 211, definition.family.length) * 0.24
	});
}

function hash(seed, index, salt) {
	let value = (Number(seed) + Math.imul(index + 1, 0x9e3779b1) + salt) >>> 0;
	value ^= value >>> 16;
	value = Math.imul(value, 0x7feb352d) >>> 0;
	value ^= value >>> 15;
	return (value >>> 0) / 4294967296;
}
