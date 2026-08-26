//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicFeedCard.js
 * @description Renders one truthful social event from the normalized feed model through focused identity, content, context, reaction, and action vessels.
 * RESPONSIBILITY: orchestrate accessible card DOM and delegate chronology/provenance/reaction/action details to their specialized modules.
 * NON-RESPONSIBILITY: this renderer does not fetch social data, normalize legacy payloads, invent metrics, or own global website styling.
 * The Awtsmoos renews author, word, place, time, and consequence before the card gathers them into sight;
 * Awtsmoos.com lets one Tiferes vessel feel alive and professional while every deeper truth stays exact and bright.
 */

import { revealOrotFeedPostModel } from './feed/FeedPostModel.js?v=clean-future-001';
import { createKliContentKindBadge } from './feed/ContentKindBadge.js';
import { createFeedContext } from './feed/FeedContext.js';
import { validDate } from './feed/FeedChronology.js';
import { createFeedReactionRail } from './feed/FeedReaction.js';
import { createFeedUniversalActions } from './feed/FeedUniversalActions.js';
import { ensureOrotFeedStyles } from './feed/FeedStyleSheet.js';

/** Reveals a truthful author label without prefixing a human display name as though it were an alias. */
function revealNeshamaIdentityLabel(model) {
	if (model.aliasId && model.authorLabel && model.authorLabel !== model.aliasId) {
		return `${model.authorLabel} · @${model.aliasId}`;
	}
	if (model.aliasId) {
		return `@${model.aliasId}`;
	}
	return model.authorLabel || 'Public author';
}

/** Creates profile-capable identity DOM while preserving a readable static fallback. */
function createNeshamaIdentity(document, model, onOpenProfile) {
	const label = revealNeshamaIdentityLabel(model);
	if (!model.aliasId || !onOpenProfile) {
		const identity = document.createElement('p');
		identity.className = 'publicFeedCard__identity awtsmoosFeedIdentity';
		identity.textContent = label;
		return identity;
	}
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'publicFeedCard__profile awtsmoosFeedIdentity';
	button.textContent = label;
	button.setAttribute('aria-label', `Open ${label} profile`);
	button.addEventListener('click', () => onOpenProfile(model.aliasId));
	return button;
}

/** Creates a semantic title with navigation only when a truthful destination exists. */
function createTiferesTitle(document, model) {
	const heading = document.createElement('h3');
	heading.className = 'publicFeedTitle awtsmoosFeedTitle';
	if (!model.destination) {
		heading.textContent = model.title;
		return heading;
	}
	const link = document.createElement('a');
	link.href = model.destination;
	link.textContent = model.title;
	heading.append(link);
	return heading;
}

/** Renders one complete public feed card without synthesizing absent social evidence. */
export function renderPublicFeedCard(document, item = {}, options = {}) {
	ensureOrotFeedStyles(document);
	const viewerAliasId = options.viewerAliasId || '';
	const model = revealOrotFeedPostModel(item, { viewerAliasId });
	const card = document.createElement('article');
	const meta = document.createElement('div');
	card.className = 'publicFeedCard awtsmoosFeedCard';
	card.dataset.kind = model.kind;
	card.dataset.socialEntityKey = model.key;
	meta.className = 'awtsmoosFeedMeta';
	meta.append(createKliContentKindBadge({
		document,
		kind: model.kind,
		label: model.kindLabel
	}));
	meta.append(createNeshamaIdentity(document, model, options.onOpenProfile));
	card.append(meta, createTiferesTitle(document, model));
	if (model.excerpt) {
		const excerpt = document.createElement('p');
		excerpt.className = 'publicFeedCard__excerpt awtsmoosFeedExcerpt';
		excerpt.textContent = model.excerpt;
		card.append(excerpt);
	}
	const context = createFeedContext(document, model, { now: options.now });
	if (context.childElementCount) {
		card.append(context);
	}
	const reactions = createFeedReactionRail(document, model, viewerAliasId);
	if (reactions) {
		card.append(reactions);
	}
	card.append(createFeedUniversalActions({ document, model, viewerAliasId }));
	return card;
}

export function feedItemAliasId(item = {}) {
	return revealOrotFeedPostModel(item).aliasId;
}

export function feedItemDestination(item = {}) {
	return revealOrotFeedPostModel(item).destination;
}

export { createFeedContext as createYesodContext, validDate };
