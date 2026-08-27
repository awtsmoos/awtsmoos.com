//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicationPlanSchema
 * @description
 * One immutable intention binds actor, content, canonical home, secondary mirrors,
 * and retry identity. The Awtsmoos creates one truth before every reflection;
 * Awtsmoos.com validates that order before any database river is touched.
 */

const {
	normalizeDestination,
	validateDestination,
	uniqueDestinations,
	destinationKey
} = require('../destinations/DestinationSchema.js');

const CONTENT_KINDS = Object.freeze([
	'post',
	'question',
	'answer',
	'quote',
	'short',
	'video',
	'audio',
	'story',
	'poll',
	'live'
]);

function parse(value, fallback) {
	if (value === undefined || value === null || value === '') return fallback;
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

function normalizeSource(value = {}) {
	return {
		type: String(value.type || value.contentType || 'post'),
		id: String(value.id || value.postId || ''),
		heichelId: String(value.heichelId || ''),
		seriesId: String(value.seriesId || 'root'),
		aliasId: String(value.aliasId || '')
	};
}

function normalizePlan(value = {}) {
	const primary = normalizeDestination(
		parse(value.primary || value.canonicalDestination, {}),
		'canonical'
	);
	primary.kind = 'canonical';
	const secondaryRaw = parse(value.secondary || value.secondaryDestinations, []);
	const secondary = uniqueDestinations(Array.isArray(secondaryRaw) ? secondaryRaw : []);
	return {
		version: 1,
		idempotencyKey: String(value.idempotencyKey || value.clientRequestId || '').trim().slice(0, 160),
		aliasId: String(value.aliasId || '').trim().slice(0, 120),
		contentKind: CONTENT_KINDS.includes(value.contentKind || value.postKind)
			? value.contentKind || value.postKind
			: 'post',
		primary,
		secondary,
		source: normalizeSource(parse(value.source || value.canonicalSource, {})),
		parentQuestionId: String(value.parentQuestionId || value.questionId || '').trim().slice(0, 180),
		scheduledAt: Number(value.scheduledAt || 0),
		visibility: ['public', 'unlisted', 'private'].includes(value.visibility)
			? value.visibility
			: 'public'
	};
}

function validatePlan(plan) {
	const errors = [];
	if (!plan.aliasId) errors.push('aliasId is required.');
	const primaryValidation = validateDestination(plan.primary, { canonical: true });
	errors.push(...primaryValidation.errors);
	if (plan.secondary.length > 24) errors.push('No more than 24 secondary destinations are allowed.');
	const primaryKey = destinationKey(plan.primary);
	for (const destination of plan.secondary) {
		const validation = validateDestination(destination, { canonical: false });
		errors.push(...validation.errors.map(message => `${destination.heichelId}: ${message}`));
		if (destinationKey({ ...destination, kind: 'canonical' }) === primaryKey) {
			errors.push('The canonical destination cannot also be secondary.');
		}
	}
	if (plan.contentKind === 'answer' && !plan.parentQuestionId) {
		errors.push('Answers require parentQuestionId.');
	}
	if (plan.source.id && (!plan.source.heichelId || !plan.source.type)) {
		errors.push('An existing source requires type, id and heichelId.');
	}
	return { valid: errors.length === 0, errors };
}

function planFromRequest($i) {
	const body = $i.$_POST || {};
	return normalizePlan(parse(body.publicationPlan, body));
}

module.exports = {
	CONTENT_KINDS,
	parse,
	normalizeSource,
	normalizePlan,
	validatePlan,
	planFromRequest
};
