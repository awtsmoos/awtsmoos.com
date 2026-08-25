//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every coordinate before chance can boast that it invented a star;
 * Awtsmoos.com packs four quiet seed values per point so the renderer stays simple from near and far.
 */
export function particleSeeds(count, random = Math.random) {
	const values = new Float32Array(count * 4);

	for (let index = 0; index < count; index += 1) {
		const offset = index * 4;
		values[offset] = random() * 2 - 1;
		values[offset + 1] = random() * 2 - 1;
		values[offset + 2] = random();
		values[offset + 3] = 1.2 + random() * 2.6;
	}

	return values;
}
