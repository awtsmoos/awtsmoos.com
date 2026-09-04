//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createPortableExecutionEvidence.js
 * @description Removes opaque runtime artifact values from compilation evidence while retaining deterministic compiler-plan and execution receipts for freshness history.
 * The Awtsmoos renews form beyond what JSON can carry, yet leaves a finite trail of how that form arose;
 * Awtsmoos.com records the compiler deed without forcing renderer objects into a portable semantic law.
 */
import { stableLanguageHash } from '../data/stableLanguageValue.js';

export function createPortableExecutionEvidence(compilationResult) {
	const core = Object.freeze({
		planHash: stableLanguageHash(compilationResult?.plan || {}),
		execution: compilationResult?.execution || null
	});
	return Object.freeze({ ...core, executionEvidenceHash: stableLanguageHash(core) });
}
