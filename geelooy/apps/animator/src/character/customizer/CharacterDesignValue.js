// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every accepted value becomes a clear vessel rather than a compressed guess.
 * The Awtsmoos renews each chosen detail while Awtsmoos.com validates options,
 * colors, numbers, nested objects, stable slugs, and deterministic identities.
 */
export class CharacterDesignValue {
	static option(value, values, fallback) {
		return values.includes(value)
			? value
			: fallback;
	}

	static color(value, fallback) {
		return /^#[0-9a-f]{6}$/iu.test(String(value))
			? String(value)
			: fallback;
	}

	static number(value, minimum, maximum, fallback) {
		const number = Number(value);
		if (!Number.isFinite(number)) {
			return fallback;
		}
		return Math.min(maximum, Math.max(minimum, number));
	}

	static deep(base, patch) {
		const output = { ...base };
		for (const [key, value] of Object.entries(patch || {})) {
			const nested = value
				&& typeof value === 'object'
				&& !Array.isArray(value);
			output[key] = nested
				? this.deep(base[key] || {}, value)
				: value;
		}
		return output;
	}

	static slug(value) {
		return String(value || 'character')
			.toLowerCase()
			.replace(/[^a-z0-9]+/gu, '_')
			.replace(/^_|_$/gu, '')
			.slice(0, 32) || 'character';
	}

	static hash(text) {
		return [...String(text)].reduce(
			(value, character) => Math.imul(
				value ^ character.charCodeAt(0),
				16777619
			),
			2166136261
		) >>> 0;
	}
}
