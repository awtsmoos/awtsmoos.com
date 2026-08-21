// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityModel
 * @description The Awtsmoos lets one kernel response become every social card without losing origin or measured consequence;
 * Awtsmoos.com places canonical Reference/Copy coordinates directly on the model so no surface must reconstruct provenance anew.
 */
function text(...values) {
	return values.find(value => typeof value === 'string' && value.trim())?.trim() || '';
}

function count(metric) {
	return Number(metric?.total || 0) || 0;
}

export function socialEntityKey(model = {}) {
	const entity = model.entity || model;
	return [entity.type, entity.heichelId, entity.seriesId, entity.postId, entity.id]
		.filter(Boolean)
		.map(String)
		.join(':');
}

export function referenceContext(model, viewerAliasId = '') {
	const entity = model?.entity || {};
	return {
		sourceType: entity.type || 'post',
		sourceId: entity.id,
		sourceHeichel: entity.heichelId,
		sourceSeries: entity.seriesId || 'root',
		sourceAlias: model?.authorAliasId || entity.aliasId || '',
		viewerAliasId,
		returnPath: globalThis.location?.pathname || ''
	};
}

export function socialEntityModel(kernel = {}) {
	const entity = kernel.entity || {};
	const raw = entity.raw || {};
	const summary = kernel.summary || null;
	const viewerState = kernel.viewerState || null;
	const model = {
		kernel,
		entity,
		summary,
		capabilities: kernel.capabilities || {},
		actions: Array.isArray(kernel.actions) ? kernel.actions : [],
		relations: kernel.relations || null,
		viewerState,
		key: socialEntityKey(entity),
		type: entity.type || '',
		id: entity.id || '',
		title: text(raw.title, raw.name, raw.subject, entity.contentKind, entity.type) || 'Social item',
		excerpt: text(raw.summary, raw.excerpt, raw.description, raw.contentPreview, raw.body),
		authorAliasId: text(raw.authorAliasId, raw.aliasId, entity.aliasId),
		createdAt: Number(raw.createdAt || raw.timestamp || 0),
		deepLink: kernel.deepLink || '',
		metrics: {
			comments: count(summary?.comments),
			answers: count(summary?.answers),
			reactions: count(summary?.reactions),
			references: count(summary?.references)
		}
	};
	model.referenceContext = referenceContext(model, viewerState?.aliasId || '');
	return model;
}

export function actionById(model, id) {
	return model?.actions?.find(action => action.id === id) || null;
}

export { count, text };
