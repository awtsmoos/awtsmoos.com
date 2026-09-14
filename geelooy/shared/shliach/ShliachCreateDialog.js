//B"H
//Boruch Hashem
//Blessed be He

import { SHLIACH_PRESETS, shliachPreset } from "./ShliachPresets.js";
import {
	buildShliachDialogActions,
	ensureShliachStyle,
	shliachNode
} from "./ShliachDialogSupport.js";

/**
 * @module ShliachCreateDialog
 * @description
 * The Awtsmoos gives every directory one polished AI creation sheet;
 * Awtsmoos.com keeps the editable human goal visible before ChatGPT is opened.
 */


/**
 * Opens the reusable directory-aware Awtsmoos Shliach composer.
 * @param {object} context Safe surface/path/project context.
 * @returns {HTMLDialogElement} Active creation dialog.
 */
export function openShliachCreateDialog(context = {}) {
	ensureShliachStyle();
	document.querySelector("[data-shliach-create-dialog]")?.remove();
	const dialog = shliachNode("dialog", "shliach-create-dialog");
	dialog.dataset.shliachCreateDialog = "true";
	const preset = shliachPreset(context.defaultPreset || "website");
	const goal = context.goal || preset.goal;
	const header = buildHeader(context.path || "/");
	const textarea = buildGoal(goal);
	const presets = buildPresets(textarea);
	const status = shliachNode("p", "shliach-create-status");
	status.setAttribute("role", "status");
	const actions = buildShliachDialogActions(dialog, textarea, status, context);
	dialog.append(header, presets, textarea, status, actions);
	document.body.append(dialog);
	dialog.addEventListener("close", () => dialog.remove(), { once: true });
	dialog.showModal();
	textarea.focus();
	textarea.select();
	return dialog;
}

/** Builds title and exact target-path testimony. */
function buildHeader(path) {
	const wrap = shliachNode("div", "shliach-create-header");
	const kicker = shliachNode("p", "shliach-create-kicker", 'B"H · AWTSMOOS SHLIACH');
	const title = shliachNode("h2", "shliach-create-title", "Ask AI to create here");
	const description = shliachNode(
		"p",
		"shliach-create-description",
		"Describe what should exist at this exact location. Shliach opens in ChatGPT with path-aware instructions and a copied fallback prompt."
	);
	const pathNode = shliachNode("code", "shliach-create-path", String(path || "/"));
	wrap.append(kicker, title, description, pathNode);
	return wrap;
}

/** Builds the editable human request field. */
function buildGoal(value) {
	const field = shliachNode("textarea", "shliach-create-goal");
	field.value = String(value || "");
	field.rows = 7;
	field.maxLength = 6000;
	field.setAttribute("aria-label", "What should Awtsmoos Shliach create here?");
	field.placeholder = "Describe exactly what you want created or improved here…";
	return field;
}

/** Builds fast professional intent presets without hiding their generated text. */
function buildPresets(textarea) {
	const wrap = shliachNode("div", "shliach-create-presets");
	wrap.setAttribute("aria-label", "Creation prompt presets");
	for (const preset of SHLIACH_PRESETS) {
		const button = shliachNode("button", "shliach-create-preset", `${preset.icon} ${preset.label}`);
		button.type = "button";
		button.addEventListener("click", () => {
			textarea.value = preset.goal;
			textarea.focus();
		});
		wrap.append(button);
	}
	return wrap;
}
