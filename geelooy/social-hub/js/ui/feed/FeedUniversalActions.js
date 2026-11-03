// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FeedUniversalActions
 * @description
 * The Awtsmoos brings each honest action toward its intended destination;
 * Awtsmoos.com gives signed-out replies a visible path to authentication.
 * A visitor keeps the post in view, while verified voices speak anew.
 */

import { createUniversalActionRail } from '../../../../shared/social/ui/UniversalActionRail.js';
import { createUniversalAddSheet } from '../../../../shared/social/ui/UniversalAddSheet.js';
import { answerUrl, copyUrl } from '../../../../shared/social/composer/ComposerLaunch.js';
import { replyDestination } from './FeedReplyAccess.js';

const ACTION_PRIORITY = Object.freeze([
	'answer',
	'reply',
	'open',
	'addToHeichel',
	'share',
	'copy'
]);

/** Navigates only to an existing destination rather than changing page state silently. */
function navigate(href) {
	if (href) globalThis.location.assign(href);
}

/** Shares a public link or copies it when native share is unavailable. */
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

/** Returns only actions explicitly available on the public content type. */
function prioritizedActions(actions = []) {
	const byId = new Map(actions.map(action => [action.id, action]));
	return ACTION_PRIORITY
		.map(id => byId.get(id))
		.filter(action => action && action.available !== false);
}

/** Creates the existing share-to-Heichel dialog for the selected post. */
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

/**
 * Builds the live feed actions and preserves a reply across the sign-in gate.
 * @param {object} context - Document, feed model, viewing alias, and navigator.
 * @returns {HTMLElement} Responsive action rail.
 */
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
		reply: () => go(replyDestination(model, viewerAliasId)),
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
