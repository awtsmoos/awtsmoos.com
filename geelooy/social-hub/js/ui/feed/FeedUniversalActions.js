//B"H
//Boruch Hashem
//Blessed is He

import { createUniversalActionRail } from '../../../../shared/social/ui/UniversalActionRail.js';
import { createUniversalAddSheet } from '../../../../shared/social/ui/UniversalAddSheet.js';
import { answerUrl, copyUrl } from '../../../../shared/social/composer/ComposerLaunch.js';

/**
 * @module FeedUniversalActions
 * @description
 * The Awtsmoos is beyond reading and every secondary tool, while Awtsmoos.com keeps response and canonical content access nearest to the hand before reference, sharing, or copying machinery;
 * this Chesed-like feed adapter orders intention first, rejects absent action shadows, and delegates retraction to the one shared universal action rail of light.
 */

const ACTION_PRIORITY = Object.freeze([
	'answer',
	'reply',
	'open',
	'addToHeichel',
	'share',
	'copy'
]);

function navigate(href) {
	if (href) globalThis.location.assign(href);
}

async function share(model, button) {
	if (!model.deepLink) return;
	const origin = globalThis.location?.origin || 'https://awtsmoos.com';
	const url = new URL(model.deepLink, origin).href;
	if (globalThis.navigator?.share) {
		return globalThis.navigator.share({
			title: model.title,
			text: model.excerpt,
			url
		});
	}
	if (globalThis.navigator?.clipboard?.writeText) {
		await globalThis.navigator.clipboard.writeText(url);
		if (button) button.dataset.shared = 'copied';
	}
}

/** Returns only real, available actions in the single intent-first ordering contract. */
function prioritizedActions(actions = []) {
	const byId = new Map(actions.map(action => [action.id, action]));
	return ACTION_PRIORITY
		.map(id => byId.get(id))
		.filter(action => action && action.available !== false);
}

function addSheet(document, model, viewerAliasId) {
	const sheet = createUniversalAddSheet({
		document,
		model: model.shared,
		context: {
			viewerAliasId,
			returnPath: globalThis.location?.pathname || ''
		}
	});
	document.body.append(sheet);
	return sheet;
}

/** Builds the live feed rail with intent-first ordering and shared responsive retraction. */
export function createFeedUniversalActions({
	document,
	model,
	viewerAliasId = '',
	go = navigate
}) {
	let sheet = null;
	const openSheet = () => {
		if (!sheet?.isConnected) {
			sheet = addSheet(document, model, viewerAliasId);
		}
		sheet.showModal();
	};
	const handlers = {
		share: ({ event }) => share(model, event.currentTarget),
		reply: () => go(model.destination ? `${model.destination}#comments` : ''),
		answer: () => go(answerUrl(model.shared, { aliasId: viewerAliasId })),
		open: () => go(model.deepLink || model.destination || ''),
		addToHeichel: openSheet,
		copy: () => go(copyUrl(model.shared, { viewerAliasId }))
	};
	const railModel = {
		...model.shared,
		actions: prioritizedActions(model.shared.actions)
	};
	return createUniversalActionRail({
		document,
		model: railModel,
		handlers,
		limit: ACTION_PRIORITY.length
	});
}

export {
	ACTION_PRIORITY,
	addSheet,
	navigate,
	prioritizedActions,
	share
};
