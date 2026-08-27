//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SocialRadianceRoutes
 * @description
 * This gate brings selected ideas from Radiance of Infinity into the native
 * Geelooy social river. It accepts only explicit public candidate signals,
 * writes nothing, and returns an explanation ledger for every ranked spark.
 */

const { er } = require('./helper/general.js');
const {
	DEFAULT_RADIANCE_WEIGHTS,
	RADIANCE_LIMITS,
	rankByRadiance
} = require('./helper/radiance/index.js');

function isMethod($i, method) {
	return $i?.request?.method === method;
}

function requestBody($i) {
	return $i?.$_POST && typeof $i.$_POST === 'object' ? $i.$_POST : {};
}

function parseCandidates(rawCandidates) {
	if (Array.isArray(rawCandidates)) return rawCandidates;
	if (typeof rawCandidates !== 'string') return [];

	try {
		const parsed = JSON.parse(rawCandidates);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function metaResponse() {
	return {
		success: {
		name: 'geelooy-radiance',
		mode: 'explainable-public-discovery',
		weights: DEFAULT_RADIANCE_WEIGHTS,
		limits: RADIANCE_LIMITS,
		privacy: 'caller-supplied public signals only',
		persistence: 'none'
	}
	};
}

function rankResponse($i) {
	const input = requestBody($i);
	const candidates = parseCandidates(input.candidates);
	if (!candidates.length) {
		return er({
			code: 'MISSING_RADIANCE_CANDIDATES',
			message: 'Pass a non-empty candidates array.'
		});
	}

	return {
		success: {
			items: rankByRadiance(candidates, {
				limit: input.limit,
				weights: input.weights
			}),
			inputCount: Math.min(candidates.length, RADIANCE_LIMITS.maximumCandidates)
		}
	};
}

module.exports = ({ $i } = {}) => ({
	'/radiance/meta': async () => isMethod($i, 'GET')
		? metaResponse()
		: er({ code: 'BAD_METHOD', message: 'Use GET.' }),
	'/radiance/rank': async () => isMethod($i, 'POST')
		? rankResponse($i)
		: er({ code: 'BAD_METHOD', message: 'Use POST.' })
});
