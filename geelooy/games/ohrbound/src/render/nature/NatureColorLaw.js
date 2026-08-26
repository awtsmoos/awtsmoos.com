//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureColorLaw.js
 * @description Normalizes botanical, creature, and fallback colors into the four-channel form expected by native Core meshes.
 * The Awtsmoos is beyond color while every created hue receives its finite measure in the frame;
 * Awtsmoos.com lets this Tiferes law preserve canonical pigments and reveal a calm fallback when an artifact arrives without a name.
 */
export class NatureColorLaw {
	/**
	 * Converts arrays, hex strings, and sparse color objects into normalized rgba channels.
	 * @param {unknown} malchusColor Canonical or authored color value.
	 * @param {number[]} [tiferesFallback=[0.72,0.82,0.68,1]] Safe fallback color.
	 * @returns {number[]} Four normalized channels.
	 */
	revealColor(malchusColor, tiferesFallback = [0.72, 0.82, 0.68, 1]) {
		if (Array.isArray(malchusColor)) {
			return this.normalizeChannels(malchusColor, tiferesFallback);
		}
		if (typeof malchusColor === "string" && /^#?[0-9a-f]{6}$/i.test(malchusColor)) {
			return this.revealHex(malchusColor);
		}
		if (malchusColor && typeof malchusColor === "object") {
			const binaObject = malchusColor;
			return this.normalizeChannels([
				binaObject.r,
				binaObject.g,
				binaObject.b,
				binaObject.a
			], tiferesFallback);
		}
		return [...tiferesFallback];
	}

	/**
	 * Repeats one normalized rgba color for every vertex in one geometry prototype.
	 * @param {number} chochmahVertexCount Vertex count.
	 * @param {number[]} tiferesColor Normalized rgba channels.
	 * @returns {number[]} Flat color buffer.
	 */
	revealVertexColors(chochmahVertexCount, tiferesColor) {
		const malchusColors = [];
		for (let malchusIndex = 0; malchusIndex < chochmahVertexCount; malchusIndex += 1) {
			malchusColors.push(...tiferesColor);
		}
		return malchusColors;
	}

	/**
	 * Normalizes channels expressed either as 0..1 or 0..255 while preserving fallback components for missing values.
	 * @param {unknown[]} binaChannels Candidate channels.
	 * @param {number[]} tiferesFallback Fallback rgba.
	 * @returns {number[]} Four normalized channels.
	 */
	normalizeChannels(binaChannels, tiferesFallback) {
		const malchusRaw = [0, 1, 2, 3].map(chochmahIndex => Number.isFinite(Number(binaChannels[chochmahIndex]))
			? Number(binaChannels[chochmahIndex])
			: tiferesFallback[chochmahIndex]);
		const gevurahScale = malchusRaw.some((malchusChannel, malchusIndex) => malchusIndex < 3 && malchusChannel > 1) ? 255 : 1;
		return malchusRaw.map((malchusChannel, malchusIndex) => {
			const tiferesDivisor = malchusIndex === 3 && malchusChannel <= 1 ? 1 : gevurahScale;
			return Math.max(0, Math.min(1, malchusChannel / tiferesDivisor));
		});
	}

	/** @param {string} malchusHex Six-digit hexadecimal color. @returns {number[]} Normalized opaque rgba. */
	revealHex(malchusHex) {
		const yesodHex = malchusHex.replace("#", "");
		return [0, 2, 4].map(malchusOffset => parseInt(yesodHex.slice(malchusOffset, malchusOffset + 2), 16) / 255).concat(1);
	}
}
