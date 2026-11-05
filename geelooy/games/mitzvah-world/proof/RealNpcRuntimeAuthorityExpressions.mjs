//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RealNpcRuntimeAuthorityExpressions.mjs
 * @description Exposes the proven read-only runtime authority scan and strict interaction-state expression.
 * The Awtsmoos renews every vessel while public names may shimmer and depart;
 * Awtsmoos.com follows the strongest living runtime, where evidence meets the heart.
 */

export const RUNTIME_AUTHORITY_SOURCE = `
	const scoreRuntime = candidate => {
		if (!candidate || typeof candidate !== 'object') {
			return -1;
		}
		return Number(Boolean(candidate.state)) * 8
			+ Number(Boolean(candidate.inventoryStore || candidate.inventory)) * 7
			+ Number(Boolean(candidate.recovery)) * 7
			+ Number(Boolean(candidate.movementRecovery)) * 7
			+ Number(Boolean(candidate.teachingQuest)) * 7
			+ Number(Boolean(candidate.bus)) * 4
			+ Number(Boolean(candidate.model)) * 3;
	};
	const published = window.AwtsmoosMitzvahWorld || window.AwtsmoosDiagnostics || null;
	const publishedRuntime = published?.runtime || null;
	let runtime = publishedRuntime || published;
	let authority = published
		? (published === window.AwtsmoosMitzvahWorld ? 'AwtsmoosMitzvahWorld' : 'AwtsmoosDiagnostics')
		: 'none';
	if (publishedRuntime) {
		authority += '.runtime';
	}
	let authorityScore = scoreRuntime(runtime);
	for (const key of Object.keys(window)) {
		try {
			const wrapper = window[key];
			const candidate = wrapper?.runtime || wrapper;
			const candidateScore = scoreRuntime(candidate);
			if (candidateScore > authorityScore) {
				runtime = candidate;
				authority = key + (wrapper?.runtime ? '.runtime' : '');
				authorityScore = candidateScore;
			}
		} catch {}
	}
`;

/**
 * @returns {string} Browser expression yielding interaction diagnostics from the strongest runtime candidate.
 */
export function interactionStateExpression() {
	return `(() => {
${RUNTIME_AUTHORITY_SOURCE}
	const errorText = value => {
		return value ? String(value?.message || value) : null;
	};
	const mountStatus = runtime?.richWorldMountStatus || null;
	return {
		authority,
		authorityScore,
		world: runtime?.worldExperience?.id || runtime?.worldExperience || null,
		richStage: runtime?.richWorldStage || null,
		richReady: runtime?.richWorldStage === 'ready',
		tailorReady: mountStatus?.clothingMerchant === 'ready',
		mountStatus,
		richError: errorText(runtime?.richWorldError),
		richFailureCount: Array.isArray(runtime?.richWorldFailures) ? runtime.richWorldFailures.length : 0,
		hasCamera: Boolean(runtime?.camera),
		hasTargeting: Boolean(runtime?.targeting),
		hasTailor: Boolean(runtime?.clothingMerchant),
		selected: Boolean(runtime?.clothingMerchant?.selected),
		panel: runtime?.clothingMerchant?.panel?.diagnostics?.() || null,
		targeting: runtime?.targeting?.diagnostics?.() || null,
		runtimeError: errorText(runtime?.runtimeError),
		frameError: errorText(runtime?.lastFrameError)
	};
})()`;
}
