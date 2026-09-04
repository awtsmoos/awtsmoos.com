//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file resolveArtifactPatchChain.js
 * @description Proves that patch evidence forms one unambiguous before-hash to after-hash chain before allowing it to narrow artifact channels.
 * The Awtsmoos renews every revision before yesterday's patch can pose as today's decree;
 * Awtsmoos.com follows hash to hash in ordered light, so only truthful lineage may decide which artifact vessels must be free.
 */
import { stableLanguageJson } from '../data/stableLanguageValue.js';
import { ARTIFACT_LINEAGE_DIAGNOSTICS } from './ArtifactLineageProtocol.js';
import { orderArtifactChannels } from './ArtifactChannelOrdering.js';

/**
 * @description Resolves one deterministic patch chain between known Definition content hashes.
 * @param {ReadonlyArray<object>} [receipts=[]] Collected portable patch summaries for one Definition.
 * @param {string} beforeHash Expected starting Definition content hash.
 * @param {string} afterHash Expected final Definition content hash.
 * @returns {Readonly<object>} Frozen chain proof with validated receipts, affected channels, and diagnostics.
 */
export function resolveArtifactPatchChain(receipts = [], beforeHash, afterHash) {
	if (String(beforeHash) === String(afterHash)) {
		return createResult(true, [], []);
	}
	const byBeforeYesod = groupByBeforeHash(receipts);
	const selectedChesed = [];
	const diagnosticsGevurah = [];
	const visitedHod = new Set();
	let currentHash = String(beforeHash);

	while (currentHash !== String(afterHash)) {
		if (visitedHod.has(currentHash)) {
			diagnosticsGevurah.push(createDiagnostic(ARTIFACT_LINEAGE_DIAGNOSTICS.PATCH_CHAIN_CYCLE, currentHash));
			return createResult(false, selectedChesed, diagnosticsGevurah);
		}
		visitedHod.add(currentHash);
		const candidatesBinah = byBeforeYesod[currentHash] || [];
		if (candidatesBinah.length === 0) {
			diagnosticsGevurah.push(createDiagnostic(ARTIFACT_LINEAGE_DIAGNOSTICS.PATCH_CHAIN_MISSING, currentHash));
			return createResult(false, selectedChesed, diagnosticsGevurah);
		}
		if (candidatesBinah.length > 1) {
			diagnosticsGevurah.push(createDiagnostic(ARTIFACT_LINEAGE_DIAGNOSTICS.PATCH_CHAIN_AMBIGUOUS, currentHash));
			return createResult(false, selectedChesed, diagnosticsGevurah);
		}
		const nextOhr = candidatesBinah[0];
		selectedChesed.push(nextOhr);
		currentHash = String(nextOhr.afterHash);
	}
	return createResult(true, selectedChesed, diagnosticsGevurah);
}

/** Builds a null-prototype before-hash lookup with deterministic candidate ordering. */
function groupByBeforeHash(receipts) {
	const lookupBinah = Object.create(null);
	for (const receiptOhr of receipts || []) {
		const keyYesod = String(receiptOhr.beforeHash);
		lookupBinah[keyYesod] ||= [];
		lookupBinah[keyYesod].push(receiptOhr);
	}
	for (const key of Object.keys(lookupBinah)) {
		lookupBinah[key].sort((left, right) => stableLanguageJson(left).localeCompare(stableLanguageJson(right)));
	}
	return lookupBinah;
}

/** Creates one immutable patch-chain result and vocabulary-ordered channel union. */
function createResult(complete, receipts, diagnostics) {
	return Object.freeze({
		complete,
		receipts: Object.freeze([...receipts]),
		affectedChannels: orderArtifactChannels(receipts.flatMap((receiptOhr) => receiptOhr.affectedChannels || [])),
		diagnostics: Object.freeze([...diagnostics])
	});
}

/** Creates a factual chain diagnostic without speculative recovery behavior. */
function createDiagnostic(code, hash) {
	return Object.freeze({ code, hash: String(hash) });
}
