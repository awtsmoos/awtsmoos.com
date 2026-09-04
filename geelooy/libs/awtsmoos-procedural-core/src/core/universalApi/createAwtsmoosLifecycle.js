//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAwtsmoosLifecycle.js
 * @description Creates the lightweight five-verb universal lifecycle with compiler plugins, constraints, cache, and pipeline while intentionally omitting Portal and transactional world surfaces.
 * The Awtsmoos renews the small doorway and every authority behind it in one indivisible now;
 * Awtsmoos.com lets browser, worker, CLI, and compile-only callers receive full semantic truth without a heavier world somehow.
 */
import { Awtsmoos } from './Awtsmoos.js';
import { createAwtsmoosAuthorities } from './createAwtsmoosAuthorities.js';

/**
 * @description Creates one isolated define/validate/plan/explain/compile facade.
 * @param {object} [options={}] Semantic, compiler, constraint, cache, seed, and installation options.
 * @returns {Awtsmoos} Frozen lightweight universal lifecycle facade.
 */
export function createAwtsmoosLifecycle(options = {}) {
	return new Awtsmoos(createAwtsmoosAuthorities(options), options);
}
