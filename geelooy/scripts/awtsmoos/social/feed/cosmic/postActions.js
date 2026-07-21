// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostActions
 * @description
 * Every response becomes an explicit choice. The Awtsmoos gives Awtsmoos.com
 * controls with focus, pressed state, honest loading, and a path back to the source.
 */
import { reactionSummary, toggleReaction } from "../reactionStore.js";
import { appendChildren, button, createIcon, element, link } from "./dom.js";
import { createPostActionMenu } from "./postActionMenu.js";
import { shareObject } from "./postShare.js";

const ACTION_LABELS = Object.freeze({
	appreciate: "Appreciate",
	discuss: "Discuss",
	reference: "Reference",
	preserve: "Preserve",
	share: "Share"
});

function actionButton(doc, key, glyph, count = "") {
	const control = button(doc, ACTION_LABELS[key], "cosmic-action");
	control.dataset.cosmicAction = key;
	appendChildren(
		control,
		createIcon(doc, glyph),
		element(doc, "span", "cosmic-action-label", ACTION_LABELS[key])
	);
	if (count) {
		const value = element(doc, "span", "cosmic-action-count", count);
		value.setAttribute("aria-hidden", "true");
		control.append(value);
	}
	return control;
}

function syncAppreciation(control, model) {
	const summary = reactionSummary(model.id, model.counts);
	control.setAttribute("aria-pressed", String(summary.active.includes("like")));
	const count = control.querySelector(".cosmic-action-count");
	if (count) {
		count.textContent = String(summary.total || "");
	}
}

function referenceControl(doc, model, post, actions) {
	if (typeof actions.reference === "function") {
		const control = actionButton(doc, "reference", "⛓");
		control.addEventListener("click", () => actions.reference(post));
		return control;
	}
	const control = link(doc, "⛓ Reference", model.href || "/heichelos", "cosmic-action");
	control.setAttribute("aria-label", "Reference");
	return control;
}

function invokeOpen(model, post, actions) {
	if (typeof actions.open === "function") {
		actions.open(post);
		return;
	}
	if (model.href) {
		location.assign(model.href);
	}
}

/** Builds keyboard-operable actions around one model and its original post. */
export function renderPostActions(doc, model, post, actions = {}) {
	const region = element(doc, "footer", "cosmic-post-actions");
	region.setAttribute("aria-label", "Post actions");
	const summary = reactionSummary(model.id, model.counts);
	const appreciate = actionButton(
		doc,
		"appreciate",
		"♡",
		summary.total ? String(summary.total) : ""
	);
	appreciate.addEventListener("click", () => {
		toggleReaction(model.id, "like");
		syncAppreciation(appreciate, model);
	});
	syncAppreciation(appreciate, model);
	const discuss = actionButton(doc, "discuss", "◌");
	discuss.addEventListener("click", () => invokeOpen(model, post, actions));
	const preserve = actionButton(doc, "preserve", "▣");
	preserve.disabled = typeof actions.save !== "function";
	if (!preserve.disabled) {
		preserve.addEventListener("click", () => actions.save(post));
	}
	const share = actionButton(doc, "share", "↗");
	share.addEventListener("click", () => shareObject(model, share, doc));
	appendChildren(
		region,
		appreciate,
		discuss,
		referenceControl(doc, model, post, actions),
		preserve,
		share,
		createPostActionMenu(doc, model, () => invokeOpen(model, post, actions))
	);
	return region;
}

/** Preserves the earlier three-argument public surface for existing callers. */
export function createPostActions(doc, object, actions = {}) {
	return renderPostActions(doc, object, object, actions);
}
