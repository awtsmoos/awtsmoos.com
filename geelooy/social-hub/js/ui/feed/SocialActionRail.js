//B"H
//Boruch Hashem
//Blessed is He

import { buildOwnedCloneUrl } from '../../../../social-actions/PostCloneUrl.js';
import { createPostReferenceButton } from '../../../../social-actions/PostReferenceAction.js';
import { createActionOverflow } from '../../../../shared/social/ui/ActionOverflow.js';

/**
 * @module SocialActionRail
 * @description
 * The Awtsmoos is beyond old rail and new rail, while Awtsmoos.com lets this compatibility vessel preserve legacy helpers without maintaining a second disclosure engine;
 * every rendered secondary deed now passes through the same shared ActionOverflow policy used by the live universal social system of light.
 */

function link(document, href, label, modifier = '') {
	const element = document.createElement('a');
	element.className = `publicFeedAction ${modifier}`.trim();
	element.href = href;
	element.textContent = label;
	return element;
}

function measuredLabel(label, metric) {
	const value = typeof metric === 'object' && metric !== null
		? Number(metric.total || 0)
		: Number(metric || 0);
	if (value <= 0) return label;
	const suffix = typeof metric === 'object' && metric.truncated ? '+' : '';
	return `${label} · ${value}${suffix}`;
}

function primaryLabel(model) {
	if (model.kind === 'question') {
		return measuredLabel('Answer', model.socialSummary?.answers);
	}
	if (model.kind === 'answer') return 'Read answer';
	return 'Open';
}

function cloneUrl(model, viewerAliasId) {
	return buildOwnedCloneUrl({
		sourceId: model.postId,
		sourceType: model.kind,
		sourceHeichel: model.heichelId,
		sourceSeries: model.seriesId,
		sourceAlias: model.aliasId,
		viewerAliasId,
		returnPath: globalThis.location?.pathname || ''
	});
}

function shareButton(document, model) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'publicFeedAction publicFeedAction--share';
	button.textContent = 'Share';
	button.disabled = !model.destination;
	button.addEventListener('click', async () => {
		if (!model.destination) return;
		const origin = globalThis.location?.origin || 'https://awtsmoos.com';
		const url = new URL(model.destination, origin).href;
		if (globalThis.navigator?.share) {
			await globalThis.navigator.share({ title: model.title, text: model.excerpt, url });
			return;
		}
		await globalThis.navigator?.clipboard?.writeText?.(url);
	});
	return button;
}

/** Builds the legacy rail through the shared responsive overflow instead of a private mechanism. */
export function createChesedSocialActionRail({ document, model, viewerAliasId = '' }) {
	const rail = document.createElement('nav');
	rail.className = 'awtsmoosSocialActionRail';
	rail.setAttribute('aria-label', `${model.kindLabel} actions`);
	const actions = [];
	if (model.destination) {
		actions.push(link(document, model.destination, primaryLabel(model), 'publicFeedAction--primary'));
		actions.push(link(
			document,
			`${model.destination}#comments`,
			measuredLabel('Discuss', model.socialSummary?.comments)
		));
	}
	if (model.referenceContext?.sourceId) {
		actions.push(createPostReferenceButton({
			document,
			context: model.referenceContext,
			label: '+ Add',
			className: 'publicFeedAction publicFeedAction--add'
		}));
		actions.push(link(document, cloneUrl(model, viewerAliasId), 'Make copy'));
	}
	actions.push(shareButton(document, model));
	rail.append(createActionOverflow({
		document,
		actions,
		maximumVisible: 2,
		renderItem: action => action
	}));
	return rail;
}

export { measuredLabel, primaryLabel };
