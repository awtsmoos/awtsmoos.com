//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicFeedCard
 * @description The Awtsmoos lets one authored spark reveal identity, context, measured consequence, reaction, and universal action;
 * Awtsmoos.com now treats the Feed as one projection of the shared social entity model instead of a separate interaction kingdom, with its renewed compatibility model carried on the same clean-future release current.
 */
import { revealOrotFeedPostModel } from './feed/FeedPostModel.js?v=clean-future-001';
import { createKliContentKindBadge } from './feed/ContentKindBadge.js';
import { createFeedReactionRail } from './feed/FeedReaction.js';
import { createFeedUniversalActions } from './feed/FeedUniversalActions.js';
import { ensureOrotFeedStyles } from './feed/FeedStyleSheet.js';

function createNeshamaIdentity(document, model, onOpenProfile) {
	const label = model.authorLabel || 'Public author';
	if (!model.aliasId || !onOpenProfile) {
		const identity = document.createElement('p');
		identity.className = 'publicFeedCard__identity awtsmoosFeedIdentity';
		identity.textContent = model.aliasId ? `@${label}` : label;
		return identity;
	}
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'publicFeedCard__profile awtsmoosFeedIdentity';
	button.textContent = `@${label}`;
	button.addEventListener('click', () => onOpenProfile(model.aliasId));
	return button;
}

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

function validDate(value) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function createYesodContext(document, model) {
	const context = document.createElement('div');
	context.className = 'awtsmoosFeedContext';
	if (model.seriesId && model.seriesId !== 'root') {
		const series = document.createElement('span');
		series.textContent = `Series ${model.seriesId}`;
		context.append(series);
	}
	if (model.sectionCount > 1) {
		const sections = document.createElement('span');
		sections.textContent = `${model.sectionCount} sections`;
		context.append(sections);
	}
	const date = validDate(model.createdAt);
	if (date) {
		const time = document.createElement('time');
		time.dateTime = date.toISOString();
		time.textContent = new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric'
		}).format(date);
		context.append(time);
	}
	return context;
}

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
	const context = createYesodContext(document, model);
	if (context.childElementCount) card.append(context);
	const reactions = createFeedReactionRail(document, model, viewerAliasId);
	if (reactions) card.append(reactions);
	card.append(createFeedUniversalActions({ document, model, viewerAliasId }));
	return card;
}

export function feedItemAliasId(item = {}) {
	return revealOrotFeedPostModel(item).aliasId;
}

export function feedItemDestination(item = {}) {
	return revealOrotFeedPostModel(item).destination;
}

export { createYesodContext, validDate };
