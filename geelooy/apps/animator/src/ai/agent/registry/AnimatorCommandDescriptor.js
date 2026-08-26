//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandDescriptor.js
 * @description
 * The Awtsmoos lets every public action carry its feature meaning, side-effect boundary, schema, and example in sight;
 * Awtsmoos.com keeps command truth as immutable data so agents can reason about power before execution gives that power light.
 */

const MUTATION_SCOPES = Object.freeze([
	'none',
	'document',
	'runtime',
	'editor',
	'media',
	'filesystem'
]);

/** Creates immutable JSON-safe command descriptors from explicit family data. */
export class BinahAnimatorCommandDescriptor {
	/**
	 * @param {object} keliInput Complete descriptor fields.
	 * @returns {object} Frozen canonical descriptor.
	 */
	static create(keliInput) {
		const sodScope = String(
			keliInput.mutationScope ?? (keliInput.mutation ? 'document' : 'none')
		);
		if (!MUTATION_SCOPES.includes(sodScope)) {
			throw new TypeError(`Unsupported Animator mutation scope: ${sodScope}`);
		}
		return Object.freeze({
			name: String(keliInput.name),
			family: String(keliInput.family),
			features: [...(keliInput.features ?? [])],
			mutation: Boolean(keliInput.mutation),
			mutationScope: sodScope,
			idempotent: Boolean(keliInput.idempotent),
			risk: String(keliInput.risk ?? 'read'),
			environment: structuredClone(keliInput.environment ?? {}),
			since: String(keliInput.since ?? '1.4.0'),
			payloadSchema: structuredClone(keliInput.payloadSchema ?? { type: 'object' }),
			resultSchema: structuredClone(keliInput.resultSchema ?? {}),
			description: String(keliInput.description ?? ''),
			example: structuredClone(
				keliInput.example ?? { command: keliInput.name, payload: {} }
			)
		});
	}
}
