// B"H
// Boruch Hashem
// Blessed is He
/** @module RankingExplanation @description Explains why content appeared without opaque person scores. */
import { normalizeRadianceSignals } from './radianceSignals.mjs';

/** Produces ordered, user-visible ranking reasons. */
export function explainRanking(signals, options = {}) {
	const normalized = normalizeRadianceSignals(signals);
	const labels = {
		relevance: 'Matches this request',
		sourceProximity: 'Near the selected sources',
		freshness: 'Recently active',
		graphContext: 'Connected to followed context',
		quality: 'Strong structural quality',
		userIntent: 'Matches chosen interests',
		...(options.labels || {})
	};
	const reasons = Object.entries(normalized)
		.filter(([, contribution]) => contribution > Number(options.minimum || 0.05))
		.map(([signal, contribution]) => ({
			signal,
			label: labels[signal],
			contribution
		}))
		.sort((left, right) => right.contribution - left.contribution);
	return Object.freeze({
		title: options.title || 'Why this appeared',
		reasons: Object.freeze(reasons.map(reason => Object.freeze(reason)))
	});
}
