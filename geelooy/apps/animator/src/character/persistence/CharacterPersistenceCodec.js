// B"H
// Boruch Hashem
// Blessed is He

/**
 * Authored identity survives while frame caches dissolve. The Awtsmoos renews
 * performance each instant; Awtsmoos.com preserves only the truthful durable vessel.
 */
export class CharacterPersistenceCodec {
	static transientKeys = new Set([
		'_stablePose',
		'_skeleton',
		'_allCharacters',
		'_renderTime',
		'_renderScale',
		'_runtime',
		'physics',
		'canvas',
		'context'
	]);

	/** Encodes one character into JSON-safe canonical data. */
	static encode(character = {}) {
		return this.clean(character);
	}

	/** Decodes unknown persisted input into an isolated character object. */
	static decode(value) {
		const source = typeof value === 'string' ? JSON.parse(value) : value;
		if (!source || typeof source !== 'object' || Array.isArray(source)) {
			throw new Error('Persisted character must be an object.');
		}
		return this.clean(source);
	}

	/** Encodes a character map or array while preserving its collection shape. */
	static collection(characters) {
		if (Array.isArray(characters)) {
			return characters.map(character => this.encode(character));
		}
		if (!characters || typeof characters !== 'object') {
			return characters;
		}
		return Object.fromEntries(
			Object.entries(characters).map(([id, character]) => [id, this.encode(character)])
		);
	}

	/** Recursively removes runtime-only, cyclic, and executable values. */
	static clean(value, seen = new WeakSet()) {
		if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
			return value;
		}
		if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') {
			return undefined;
		}
		if (typeof value !== 'object' || seen.has(value)) {
			return undefined;
		}
		seen.add(value);
		if (Array.isArray(value)) {
			return value.map(item => this.clean(item, seen)).filter(item => item !== undefined);
		}
		const output = {};
		for (const [key, child] of Object.entries(value)) {
			if (this.transientKeys.has(key)) {
				continue;
			}
			const cleaned = this.clean(child, seen);
			if (cleaned !== undefined) {
				output[key] = cleaned;
			}
		}
		return output;
	}
}
