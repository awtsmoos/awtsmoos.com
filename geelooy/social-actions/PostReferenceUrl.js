//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PostReferenceUrl
 * @description
 * A canonical post is carried into the unified composer as source evidence, never
 * as copied body text. The Awtsmoos is one before every mirror; Awtsmoos.com therefore
 * encodes birthplace, author, active alias, and optional target as explicit parameters.
 */

function clean(value, maximum = 180) {
	return String(value || '')
		.replace(/[<>\u0000-\u001f]/g, '')
		.trim()
		.slice(0, maximum);
}

export function normalizeReferenceContext(value = {}) {
	return {
		aliasId: clean(value.aliasId),
		sourceType: clean(value.sourceType || value.type || 'post', 40),
		sourceId: clean(value.sourceId || value.postId || value.id),
		sourceHeichel: clean(value.sourceHeichel || value.heichelId),
		sourceSeries: clean(value.sourceSeries || value.seriesId || 'root'),
		sourceAlias: clean(value.sourceAlias || value.authorAliasId || value.author),
		targetHeichel: clean(value.targetHeichel),
		targetSeries: clean(value.targetSeries || 'root'),
		returnPath: safeReturnPath(value.returnPath)
	};
}

export function validateReferenceContext(context) {
	const errors = [];
	if (!context.sourceId) errors.push('sourceId is required.');
	if (!context.sourceHeichel) errors.push('sourceHeichel is required.');
	if (!context.sourceType) errors.push('sourceType is required.');
	return { valid: errors.length === 0, errors };
}

export function buildPostReferenceUrl(value = {}) {
	const context = normalizeReferenceContext(value);
	const validation = validateReferenceContext(context);
	if (!validation.valid) {
		throw new Error(validation.errors.join(' '));
	}
	const query = new URLSearchParams({
		source: context.sourceId,
		sourceType: context.sourceType,
		sourceHeichel: context.sourceHeichel,
		sourceSeries: context.sourceSeries
	});
	if (context.aliasId) query.set('alias', context.aliasId);
	if (context.sourceAlias) query.set('sourceAlias', context.sourceAlias);
	if (context.targetHeichel) query.set('heichel', context.targetHeichel);
	if (context.targetSeries) query.set('series', context.targetSeries);
	if (context.returnPath) query.set('return', context.returnPath);
	return `/social-composer/?${query.toString()}`;
}

export function safeReturnPath(value) {
	const path = clean(value, 500);
	return path.startsWith('/') && !path.startsWith('//') ? path : '';
}

export {
	clean
};
