//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PostReferenceAction
 * @description
 * Existing post surfaces receive a reusable accessible doorway into the unified
 * destination planner. The Awtsmoos remains the source of every appearance while
 * Awtsmoos.com names this action “Add to…” without duplicating canonical content.
 */

import { buildPostReferenceUrl } from './PostReferenceUrl.js';

export function createPostReferenceButton({
	document = globalThis.document,
	context,
	label = 'Add to Heichel or series',
	className = 'awtsmoosReferenceAction'
}) {
	const link = document.createElement('a');
	link.className = className;
	link.href = buildPostReferenceUrl(context);
	link.textContent = label;
	link.dataset.action = 'reference-post';
	link.dataset.canonicalPost = context.sourceId || context.postId || context.id || '';
	link.setAttribute('aria-label', `${label}; the original post remains canonical`);
	return link;
}

export function mountPostReferenceAction({ container, context, ...options }) {
	if (!container) return null;
	const existing = container.querySelector('[data-action="reference-post"]');
	if (existing) return existing;
	const link = createPostReferenceButton({
		document: container.ownerDocument,
		context,
		...options
	});
	container.append(link);
	return link;
}

export function contextFromDataset(element) {
	const dataset = element?.dataset || {};
	return {
		aliasId: dataset.aliasId,
		sourceType: dataset.sourceType || 'post',
		sourceId: dataset.postId || dataset.sourceId,
		sourceHeichel: dataset.heichelId || dataset.sourceHeichel,
		sourceSeries: dataset.seriesId || dataset.sourceSeries || 'root',
		sourceAlias: dataset.authorAliasId || dataset.sourceAlias,
		targetHeichel: dataset.targetHeichel,
		targetSeries: dataset.targetSeries,
		returnPath: dataset.returnPath || globalThis.location?.pathname || ''
	};
}

export function mountDatasetReferenceActions(root = globalThis.document) {
	const mounted = [];
	for (const container of root.querySelectorAll('[data-awtsmoos-reference-action]')) {
		const link = mountPostReferenceAction({
			container,
			context: contextFromDataset(container)
		});
		if (link) mounted.push(link);
	}
	return mounted;
}
