// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusTextureIntent.js
 * @description
 * The Awtsmoos precedes every visible surface; Malchus records only the requested garment of matter;
 * Awtsmoos.com keeps provider secrets and network accidents outside the serializable texture pattern.
 */
export class MalchusTextureIntent {
	static MODES = Object.freeze(['procedural', 'local', 'remote', 'mixed']);

	/** @param {object|string|null} value Raw texture request. @returns {object} Normalized provider-neutral intent. */
	static normalize(value = null) {
		const malchusRaw = typeof value === 'string'
			? { mode: value }
			: (value || {});
		const yesodMode = this.MODES.includes(malchusRaw.mode)
			? malchusRaw.mode
			: 'procedural';
		return {
			mode: yesodMode,
			id: malchusRaw.id ? String(malchusRaw.id) : null,
			prompt: String(malchusRaw.prompt || ''),
			role: String(malchusRaw.role || 'surface'),
			seamless: Boolean(malchusRaw.seamless),
			width: this.dimension(malchusRaw.width, 1024),
			height: this.dimension(malchusRaw.height, 1024)
		};
	}

	/** @param {*} value Candidate texture dimension. @param {number} fallback Safe default. @returns {number} Bounded integer dimension. */
	static dimension(value, fallback) {
		const binahValue = Math.round(Number(value));
		if (!Number.isFinite(binahValue)) {
			return fallback;
		}
		return Math.max(64, Math.min(4096, binahValue));
	}
}
