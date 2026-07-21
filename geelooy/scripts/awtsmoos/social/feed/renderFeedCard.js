// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews real feed data inside one semantic visual vessel. This
 * Awtsmoos.com bridge preserves normalization, official inspection, and legacy events.
 */

import { createCosmicPostCard } from "./cosmic/postCard.js";
import { FEED_TYPES, normalizeFeedObject } from "./normalizeFeedObject.js";
import { openOfficialPostViewer } from "./postViewer.js?v=comments-001";
import { toggleReaction } from "./reactionStore.js";

const COMPACT_ACTION_LABELS = "Like Comment Share";

function bindCompatibilitySurface(node, object, actions) {
	const actionRegion = node.querySelector(".cosmic-post-actions");
	actionRegion?.classList.add("geelooy-feed-compact-actions");
	node.setAttribute("data-read-more", "Open official post viewer");
	node.dataset.compactActions = COMPACT_ACTION_LABELS;
	node.addEventListener("geelooy:toggle-reaction", (event) => {
		const reaction = event.detail?.reaction || "like";
		toggleReaction(object.id, reaction);
		actions.onReaction?.(object, reaction);
	});
}

/**
 * Renders one normalized object as the production cosmic feed card.
 * @param {Record<string, unknown>} input Raw or normalized feed object.
 * @param {Record<string, Function>} actions Existing feed action adapters.
 * @param {Document} documentRef Active document.
 * @returns {HTMLElement}
 */
export function renderUnifiedFeedCard(input = {}, actions = {}, documentRef = document) {
	const object = normalizeFeedObject(input);
	const open = () => {
		actions.onReadMore?.(object);
		actions.onInspect?.(object);
		openOfficialPostViewer(object);
	};
	const node = createCosmicPostCard(object, {
		documentRef,
		actions: {
			open,
			save: typeof actions.onSave === "function" ? actions.onSave : undefined,
			reference: typeof actions.onReference === "function" ?
				actions.onReference :
				undefined
		}
	});
	node.classList.add(
		"home-post-card",
		"universal-object-card",
		"geelooy-feed-card"
	);
	node.dataset.objectType = object.type;
	node.dataset.objectId = object.id;
	node.dataset.feedRenderer = "unified-feed-card";
	bindCompatibilitySurface(node, object, actions);
	node.addEventListener("click", (event) => {
		if (!event.target.closest("a, button, input, label, select, textarea")) {
			open();
		}
	});
	node.addEventListener("keydown", (event) => {
		const activatesCard = event.target === node &&
			(event.key === "Enter" || event.key === " ");
		if (activatesCard) {
			event.preventDefault();
			open();
		}
	});
	return node;
}

export { FEED_TYPES, normalizeFeedObject };
