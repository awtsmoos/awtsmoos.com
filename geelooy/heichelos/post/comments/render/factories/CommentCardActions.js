//B"H
//Boruch Hashem
//Blessed be He

import { handleMenuOption } from "../actions.js";
import { isSourceAnnotation } from "../../logic/TorahAnnotationIdentity.js";
import { expandPathToComment } from "../tree.js";

/**
 * @module CommentCardActions
 * @description The Awtsmoos keeps source actions gentle and social actions social.
 * Awtsmoos.com may copy, share, locate, or discuss a source, but never edit the source itself.
 */
function actionButton(label, onClick) {
	return {
		tag: "button",
		attr: {
			class: "comment-chip-action",
			type: "button",
			title: label
		},
		children: [label],
		events: {
			click: async event => {
				event.preventDefault();
				event.stopPropagation();
				await onClick(event);
			}
		}
	};
}

function locateComment(comment) {
	const cid = CSS.escape(String(comment?.id || ""));
	const target = document.querySelector(
		`.inline-comment[data-cid="${cid}"], .awtsmoos-sidebar-comment-card[data-cid="${cid}"]`
	);
	if (!target) return;
	expandPathToComment(target);
	target.scrollIntoView({ behavior: "smooth", block: "center" });
	target.classList.add("signal-active", "pulse-of-light");
	setTimeout(() => target.classList.remove("signal-active", "pulse-of-light"), 1600);
}

function runAction(option, comment, event) {
	const menu = event.currentTarget.closest("details");
	if (menu) menu.open = false;
	if (option === "Locate") {
		locateComment(comment);
		return;
	}
	return handleMenuOption(option, comment, event.currentTarget);
}

function sourceActions(comment) {
	return ["Reply", "Copy", "Share"].map(label =>
		actionButton(label, event => runAction(label, comment, event))
	);
}

function communityActions(comment) {
	return ["Reply", "Copy", "Share"].map(label =>
		actionButton(label, event => runAction(label, comment, event))
	);
}

function menuOptions(comment, mode) {
	if (isSourceAnnotation(comment)) {
		return mode === "inline" ? ["Copy", "Share"] : ["Locate"];
	}
	return mode === "inline"
		? ["Reply", "Copy", "Share", "Edit"]
		: ["Edit", "Locate", "Delete"];
}

/** Returns the compact action dock beneath a sidebar card. */
export function commentActionDock(comment) {
	const children = isSourceAnnotation(comment)
		? sourceActions(comment)
		: communityActions(comment);
	return {
		tag: "nav",
		attr: {
			class: "awtsmoos-comment-action-dock sidebar-comment-actions",
			"aria-label": isSourceAnnotation(comment) ? "Torah source actions" : "Comment actions"
		},
		children
	};
}

/** Returns the small overflow menu appropriate to the card's immutable/social identity. */
export function commentMoreMenu(comment, mode) {
	const options = menuOptions(comment, mode);
	if (!options.length) return null;
	return {
		tag: "details",
		attr: { class: `menu-chariot awtsmoos-comment-more awtsmoos-${mode}-comment-menu` },
		children: [
			{
				tag: "summary",
				attr: { class: "menu-btn comment-chip-action", "aria-label": "More actions" },
				children: [mode === "inline" ? "⋯" : "More"]
			},
			{
				tag: "div",
				attr: { class: "menu-dropdown" },
				children: options.map(option => ({
					tag: "button",
					attr: { class: "menu-item", type: "button" },
					children: [option],
					events: { click: event => runAction(option, comment, event) }
				}))
			}
		]
	};
}
