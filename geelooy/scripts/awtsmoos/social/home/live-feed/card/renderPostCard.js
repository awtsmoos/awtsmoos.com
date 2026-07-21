// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostCard
 * @description
 * The Awtsmoos joins identity, source, content, provenance, and action in one
 * semantic article. Awtsmoos.com keeps the common covenant while archetypes differ.
 */
import { renderPostActions } from './actions.js';
import { renderPostBreadcrumbs } from './breadcrumbs.js';
import {
	createElement,
	createLink,
	isInteractiveTarget
} from './domFactory.js';
import { renderPostIdentity } from './identity.js';
import { createPostModel } from './postModel.js';
import { renderSourceRail } from './sourceRail.js';
import { renderPostContent } from '../renderers/index.js';

/**
 * Renders one real feed object as a provenance-rich semantic article.
 *
 * @param {object} object - Real normalized feed object.
 * @param {Function} onInspect - Existing official inspection handler.
 * @returns {HTMLElement} Semantic post article.
 */
export function renderCosmicPostCard(object, onInspect) {
	const model = createPostModel(object);
	const article = createElement('article', 'home-post-card geelooy-feed-card cosmic-post-card', {
		'data-post-id': model.id,
		'data-source-kind': model.sourceKind,
		'data-source-color': model.sourceColor,
		'data-post-archetype': model.archetype
	});
	const vessel = createElement('div', 'post-card-vessel');
	const content = createElement('div', 'post-card-main');
	const breadcrumbs = renderPostBreadcrumbs(model);
	const title = createElement('h2', 'post-title');
	const titleLink = createLink(model.title, model.href, 'post-title-link');

	title.append(titleLink);
	content.append(renderPostIdentity(model));

	if (breadcrumbs) {
		content.append(breadcrumbs);
	}

	content.append(
		title,
		renderPostContent(model),
		renderDiscussionPreview(model),
		renderPostActions(model, () => onInspect?.(object))
	);
	vessel.append(renderSourceRail(model), content);
	article.append(vessel);
	article.addEventListener('click', event => {
		if (!isInteractiveTarget(event.target)) {
			onInspect?.(object);
		}
	});
	return article;
}

function renderDiscussionPreview(model) {
	const count = model.interactions.discussions;
	const preview = model.special.commentPreview;

	if (!count && !preview && !model.special.participants.length) {
		return createElement('div', 'post-discussion-preview post-discussion-empty', {},
			'Discussion and provenance remain available in the full post.'
		);
	}

	const section = createElement('section', 'post-discussion-preview', {
		'aria-label': 'Discussion preview'
	});
	const title = count
		? `${count} voices unfolding this idea`
		: 'Voices unfolding this idea';

	section.append(createElement('strong', '', {}, title));

	if (preview) {
		section.append(createElement('p', '', {}, preview));
	}

	return section;
}
