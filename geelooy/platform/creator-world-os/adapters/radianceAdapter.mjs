// B"H
// Boruch Hashem
// Blessed is He
/** @module RadianceAdapter @description Bridges native Radiance results into explainable discovery objects. */
import { explainRanking } from '../discovery/rankingExplanation.mjs';

/** Creates a dependency-injected adapter around the existing Radiance ranker. */
export function createRadianceAdapter(nativeApi) {
	if (typeof nativeApi?.rankByRadiance !== 'function') {
		throw new TypeError('Radiance adapter requires rankByRadiance.');
	}
	return Object.freeze({
		rank(objects, options = {}) {
			const candidates = objects.map(object => ({
				...object,
				id: object.id,
				context: object.context || object.heichelId || object.type,
				createdAt: normalizeTime(object.createdAt)
			}));
			return Object.freeze(nativeApi.rankByRadiance(candidates, options).map(item => {
				const signals = reasonsToSignals(item.reasons || []);
				return Object.freeze({
					...item,
					rawScore: Number(item.rawRadianceScore ?? item.radianceScore ?? 0),
					explanation: explainRanking(signals, { title: 'Why this appeared' })
				});
			}));
		}
	});
}

function normalizeTime(value) {
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return Date.parse(value || '') || 0;
}

function reasonsToSignals(reasons) {
	const signals = {};
	for (const reason of reasons) {
		const name = reason.signal || reason.code || 'relevance';
		const value = Math.abs(Number(reason.contribution || 0));
		signals[name] = Math.max(signals[name] || 0, Math.min(1, value));
	}
	return signals;
}
