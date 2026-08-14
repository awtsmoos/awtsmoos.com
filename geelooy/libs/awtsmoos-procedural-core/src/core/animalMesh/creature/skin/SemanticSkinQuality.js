// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SemanticSkinQuality.js
 * @description Measures finished semantic skin weights without changing one deformation byte.
 * The Awtsmoos gives every joint a portion and every portion a meaning; Awtsmoos.com reads confidence,
 * ambiguity, entropy, rigidity, and fallback evidence after binding so Creator tooling can distinguish valid from excellent.
 */

const ACTIVE_WEIGHT = 1e-5;
const AMBIGUOUS_DOMINANT = 0.62;
const AMBIGUOUS_SECONDARY = 0.32;
const RIGID_DOMINANT = 0.98;

/** Returns deterministic bounded quality evidence for one renderer-neutral binding. */
export function analyzeSemanticSkinQuality(binding) {
	const stride = Math.max(1, Number(binding.maximumInfluences || 1));
	const vertexCount = Math.floor(binding.jointWeights.length / stride);
	let activeInfluences = 0;
	let ambiguousVertices = 0;
	let dominantWeight = 0;
	let effectiveInfluences = 0;
	let normalizedEntropy = 0;
	let rigidVertices = 0;
	for (let vertex = 0; vertex < vertexCount; vertex += 1) {
		const metrics = vertexMetrics(binding.jointWeights, vertex * stride, stride);
		activeInfluences += metrics.active;
		ambiguousVertices += metrics.ambiguous ? 1 : 0;
		dominantWeight += metrics.dominant;
		effectiveInfluences += metrics.effective;
		normalizedEntropy += metrics.entropy;
		rigidVertices += metrics.rigid ? 1 : 0;
	}
	const divisor = Math.max(1, vertexCount);
	const summary = {
		ambiguousRatio: boundedRatio(ambiguousVertices, vertexCount),
		ambiguousVertexCount: ambiguousVertices,
		candidateCount: binding.coverage?.candidateCount || 0,
		effectiveInfluenceMean: effectiveInfluences / divisor,
		fallbackUsed: binding.coverage?.fallbackUsed === true,
		meanActiveInfluences: activeInfluences / divisor,
		meanDominantWeight: dominantWeight / divisor,
		meanNormalizedEntropy: normalizedEntropy / divisor,
		rigidRatio: boundedRatio(rigidVertices, vertexCount),
		rigidVertexCount: rigidVertices,
		semanticRegionCount: binding.coverage?.semanticRegionCount || 0,
		vertexCount
	};
	return Object.freeze({
		...summary,
		confidenceScore: confidenceScore(summary),
		warnings: Object.freeze(qualityWarnings(summary))
	});
}

function vertexMetrics(weights, offset, stride) {
	let active = 0;
	let dominant = 0;
	let entropy = 0;
	let secondary = 0;
	for (let influence = 0; influence < stride; influence += 1) {
		const weight = Math.max(0, Number(weights[offset + influence]) || 0);
		if (weight <= ACTIVE_WEIGHT) continue;
		active += 1;
		if (weight > dominant) {
			secondary = dominant;
			dominant = weight;
		} else if (weight > secondary) {
			secondary = weight;
		}
		entropy -= weight * Math.log(weight);
	}
	const normalized = stride > 1 ? entropy / Math.log(stride) : 0;
	return {
		active,
		ambiguous: dominant < AMBIGUOUS_DOMINANT || secondary > AMBIGUOUS_SECONDARY,
		dominant,
		effective: Math.exp(entropy),
		entropy: clamp01(normalized),
		rigid: dominant >= RIGID_DOMINANT
	};
}

function qualityWarnings(summary) {
	const warnings = [];
	if (summary.fallbackUsed) warnings.push(issue('CREATURE.SKIN_QUALITY_FALLBACK', 1));
	if (summary.ambiguousRatio > 0.25) warnings.push(issue('CREATURE.SKIN_QUALITY_AMBIGUOUS', summary.ambiguousRatio));
	if (summary.meanNormalizedEntropy > 0.72) warnings.push(issue('CREATURE.SKIN_QUALITY_DIFFUSE', summary.meanNormalizedEntropy));
	if (summary.vertexCount && summary.meanDominantWeight < 0.62) warnings.push(issue('CREATURE.SKIN_QUALITY_LOW_DOMINANCE', summary.meanDominantWeight));
	return warnings;
}

function confidenceScore(summary) {
	if (!summary.vertexCount) return 1;
	return clamp01(summary.meanDominantWeight
		* (1 - summary.meanNormalizedEntropy * 0.34)
		* (1 - summary.ambiguousRatio * 0.22)
		* (summary.fallbackUsed ? 0.72 : 1));
}

function issue(code, value) {
	return Object.freeze({ code, severity: 'quality', value });
}

function boundedRatio(count, total) {
	return total > 0 ? clamp01(count / total) : 0;
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
