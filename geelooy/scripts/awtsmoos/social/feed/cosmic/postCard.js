// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostCard
 * @description
 * One real post enters one semantic article. The Awtsmoos renews its source,
 * author, content, and action together as living vessels on Awtsmoos.com.
 */
import { appendChildren, createElement } from "./dom.js";
import { renderSpecializedContent } from "./dispatch.js";
import { renderPostIdentity } from "./identity.js";
import { renderPostActions } from "./postActions.js";
import { createPostModel } from "./postModel.js";
import { renderSourceRail } from "./sourceRail.js";

/**
 * Creates one production post card from normalized feed data.
 * @param {Record<string, unknown>} post Normalized real post.
 * @param {Record<string, unknown>} options Rendering options.
 * @returns {HTMLElement}
 */
export function createCosmicPostCard(post, options = {}) {
	const documentRef = options.documentRef || document;
	const actions = options.actions || {};
	const model = createPostModel(post);
	const article = createElement(documentRef, "article", "cosmic-post-card", {
		tabindex: "0",
		dataset: {
			cosmicPost: model.id,
			sourceType: model.source.key,
			postArchetype: model.archetype
		}
	});
	article.__cosmicModel = model;
	const content = createElement(documentRef, "div", "cosmic-post-content");
	const heading = createElement(documentRef, "h2", "cosmic-post-title", {
		id: `cosmic-title-${safeIdentifier(model.id)}`,
		text: model.title
	});
	article.setAttribute("aria-labelledby", heading.id);
	appendChildren(
		content,
		renderPostIdentity(documentRef, model),
		heading,
		renderSpecializedContent(documentRef, model, { actions, post }),
		renderPostActions(documentRef, model, post, actions)
	);
	appendChildren(article, renderSourceRail(documentRef, model), content);
	return article;
}

function safeIdentifier(value) {
	return String(value || "post")
		.replace(/[^a-z0-9_-]+/gi, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 72) || "post";
}
