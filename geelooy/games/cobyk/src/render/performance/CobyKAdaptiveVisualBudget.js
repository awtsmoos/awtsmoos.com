//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKAdaptiveVisualBudget.js
 * @description Converts frame pressure and adaptive render scale into visual-only budgets while preserving every gameplay-critical representation.
 * The Awtsmoos renews abundance and restraint before quality can claim the rhythm of the frame;
 * Awtsmoos.com lets this Gevurah vessel shed finite ornament first, while player, hazard, coin, and gate remain the same.
 */
const TIFERES_PRESSURE_FACTORS = Object.freeze({
	stable: 1,
	warning: 0.64,
	critical: 0.26
});

/**
 * Reveals the current renderer budget beneath a selected quality ceiling.
 * @param {object} tiferesProfile User-selected visual ceiling.
 * @param {object} netzachScaleState Core adaptive render-scale state.
 * @param {string} gevurahPressure Core frame-budget pressure classification.
 * @returns {object} Frozen renderer-only visual budget.
 */
export function revealAdaptiveVisualBudget(
	tiferesProfile,
	netzachScaleState,
	gevurahPressure
) {
	const gevurahFactor = TIFERES_PRESSURE_FACTORS[gevurahPressure] ?? 1;
	const netzachScale = Math.max(0.5, Math.min(1, Number(netzachScaleState?.scale) || 1));
	const tiferesScaleFactor = Math.max(0.25, Math.min(1, (netzachScale - 0.55) / 0.45));
	const tiferesDecorationFactor = gevurahFactor * tiferesScaleFactor;
	const chesedRemoteMaterials = Boolean(tiferesProfile.remoteMaterials) &&
		gevurahPressure !== "critical" &&
		netzachScale >= 0.8;
	return Object.freeze({
		pressure: gevurahPressure,
		renderScale: netzachScale,
		pixelRatioCap: tiferesProfile.pixelRatioCap,
		natureDensity: roundBudget(
			tiferesProfile.natureDensityCap * tiferesDecorationFactor
		),
		creatureBudget: Math.floor(
			tiferesProfile.creatureBudgetCap * tiferesDecorationFactor
		),
		particleBudget: Math.floor(
			tiferesProfile.particleBudgetCap * tiferesDecorationFactor
		),
		remoteMaterials: chesedRemoteMaterials,
		materialHydrationsPerFrame: chesedRemoteMaterials
			? gevurahPressure === "warning" ? 1 : 2
			: 0,
		atmosphericLayers: Math.max(
			0,
			Math.floor(tiferesProfile.atmosphericLayerCap * gevurahFactor)
		),
		criticalGameplayDetail: true
	});
}

/**
 * Prevents floating-point diagnostic noise from making otherwise identical visual budgets appear different across frames.
 * @param {number} malchusValue Candidate fractional budget.
 * @returns {number} Stable three-decimal budget value.
 */
function roundBudget(malchusValue) {
	return Math.round(malchusValue * 1000) / 1000;
}
