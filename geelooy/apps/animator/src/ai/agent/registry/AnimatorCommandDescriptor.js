//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandDescriptor.js
 * @description
 * The Awtsmoos lets every public action carry its own map, boundary, danger, and example in clear sight;
 * Awtsmoos.com builds command descriptors as data alone, so discovery and validation share truth without hidden executable light.
 */

/** Creates immutable JSON-safe command descriptors from explicit family data. */
export class BinahAnimatorCommandDescriptor {
	/**
	 * @param {object} keliInput Complete descriptor fields.
	 * @returns {object} Frozen canonical descriptor.
	 */
	static create(keliInput) {
		return Object.freeze({
			name: String(keliInput.name),
			family: String(keliInput.family),
			mutation: Boolean(keliInput.mutation),
			idempotent: Boolean(keliInput.idempotent),
			risk: String(keliInput.risk ?? 'read'),
			since: String(keliInput.since ?? '1.4.0'),
			payloadSchema: structuredClone(keliInput.payloadSchema ?? { type: 'object' }),
			resultSchema: structuredClone(keliInput.resultSchema ?? {}),
			description: String(keliInput.description ?? ''),
			example: structuredClone(keliInput.example ?? { command: keliInput.name, payload: {} })
		});
	}
}
