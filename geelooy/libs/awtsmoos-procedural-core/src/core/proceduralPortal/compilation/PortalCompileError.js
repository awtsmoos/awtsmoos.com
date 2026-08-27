//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalCompileError.js
 * @description Gives failed realization a stable coded envelope instead of flattening specialist evidence into an opaque message.
 * The Awtsmoos renews success and obstruction before either appears to the finite worker; Awtsmoos.com lets this Hod-like error
 * preserve phase, semantic kind, node identity, original code, and causal message so editors, tests, logs, and hosts can respond truthfully.
 */

/**
 * @description Creates one phase-aware Portal compilation error while preserving the original failure as `cause`.
 * @param {string} code Stable Portal error code.
 * @param {object} input Failure context.
 * @param {Error} [input.cause] Original specialist or adapter failure.
 * @param {string} [input.id] Semantic node identifier.
 * @param {string} [input.kind] Semantic kind being realized.
 * @param {string} [input.phase='compile'] Portal phase where the failure surfaced.
 * @param {string} [input.message] Human-readable evidence override.
 * @returns {Error} Coded error carrying structured Portal failure context.
 */
export function createPortalCompileError(code, input = {}) {
	const causeMessage = input.cause?.message || String(input.cause || 'Unknown compilation failure.');
	const error = new Error(`B"H | ${input.message || causeMessage}`, {
		cause: input.cause instanceof Error ? input.cause : undefined
	});
	error.code = String(code || 'PORTAL_COMPILE_FAILED');
	error.portal = Object.freeze({
		causeCode: input.cause?.code || null,
		id: input.id || null,
		kind: input.kind || null,
		phase: input.phase || 'compile'
	});
	return error;
}
