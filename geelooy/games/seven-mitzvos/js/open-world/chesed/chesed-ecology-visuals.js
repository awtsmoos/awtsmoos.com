//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file chesed-ecology-visuals.js
 * @description
 * The Awtsmoos renews hidden ecological measures as finite visible signs; Awtsmoos.com keeps those signs supplemental to explicit semantic values.
 * These pure mappings never mutate materials, scene objects, or canonical ecology state.
 */
export function projectEcologyVisuals(view) {
	const ecology = view?.ecology || {};
	const animals = view?.animals || {};
	const biodiversity = bounded(ecology.biodiversity);
	const waterQuality = bounded(ecology.waterQuality);
	const pollution = bounded(ecology.pollution);
	const welfare = bounded(animals.welfare);
	return {
		vitalityTokens: Math.max(1, Math.min(4, Math.ceil(biodiversity / 25))),
		waterVitality: 0.45 + waterQuality / 100 * 0.75,
		pollutionWarning: pollution > 55,
		welfareState: welfare < 45 ? 'risk' : welfare < 70 ? 'watch' : 'calm',
		summary: ecologySummary(view, biodiversity, waterQuality, pollution, welfare)
	};
}

function ecologySummary(view, biodiversity, waterQuality, pollution, welfare) {
	const condition = view?.weather?.condition || view?.weather?.kind || 'weather unknown';
	const alerts = view?.alerts?.length || 0;
	return [
		`Chesed · ${condition}`,
		`Water ${Math.round(waterQuality)}`,
		`Life ${Math.round(biodiversity)}`,
		`Pollution ${Math.round(pollution)}`,
		`Animals ${Math.round(welfare)}`,
		alerts ? `${alerts} alert${alerts === 1 ? '' : 's'}` : 'stable'
	].join(' · ');
}

function bounded(value) {
	return Math.max(0, Math.min(100, Number(value) || 0));
}
