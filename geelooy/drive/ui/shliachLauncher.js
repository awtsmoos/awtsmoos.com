//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ShliachLauncher
 * @description
 * Gives creators a visible prompt vessel that opens the Awtsmoos Shliach GPT in a
 * new tab. The Builder stays open, unsaved work stays in place, and q carries text.
 */

import { actionButton, createElement } from "./dom.js";
import { buildShliachUrl, SHLIACH_LOGO, SHLIACH_URL } from "./shliachUrl.js";

const STARTERS = Object.freeze([
	"Build my website",
	"Fix my website",
	"Add a database",
	"Add authentication",
	"Make it mobile",
	"Improve SEO",
	"Deploy this project"
]);

/**
 * Builds one reusable Shliach launch card for Platform and future Builder surfaces.
 * @param {{defaultPrompt?:string}} options Optional initial prompt.
 * @returns {HTMLElement} Accessible prompt-and-launch surface.
 */
export function createShliachLauncher(options = {}) {
	const prompt = createElement("textarea", {
		className: "shliach-prompt",
		value: options.defaultPrompt || "",
		attributes: {
			rows: "3",
			placeholder: "Ask Shliach to build, fix, explain, deploy, or improve anything…",
			"aria-label": "Prompt for Awtsmoos Shliach Agent"
		}
	});
	const open = () => openShliach(prompt.value);
	prompt.addEventListener("keydown", event => {
		if (event.key !== "Enter" || event.shiftKey) return;
		event.preventDefault();
		open();
	});
	const section = createElement("section", {
		className: "shliach-launcher",
		children: [launcherHead(), prompt, starterRow(prompt), actionRow(open)]
	});
	section.setSuggestedPrompt = value => {
		if (!prompt.value.trim()) prompt.value = String(value || "");
	};
	return section;
}

/** @returns {HTMLElement} Branded title using the saved public GPT image. */
function launcherHead() {
	return createElement("div", {
		className: "shliach-head",
		children: [
			createElement("img", {
				className: "shliach-logo",
				attributes: { src: SHLIACH_LOGO, alt: "Awtsmoos Shliach Agent logo", width: "56", height: "56" }
			}),
			createElement("div", { children: [
				createElement("strong", { text: "Awtsmoos Shliach Agent" }),
				createElement("span", { text: "Open a dedicated ChatGPT conversation with your prompt already loaded." })
			] })
		]
	});
}

/** @param {HTMLTextAreaElement} prompt Prompt vessel. @returns {HTMLElement} Starter chips. */
function starterRow(prompt) {
	return createElement("div", {
		className: "shliach-starters",
		children: STARTERS.map(value => actionButton(value, () => {
			prompt.value = value;
			prompt.focus();
		}, { className: "shliach-chip" }))
	});
}

/** @param {Function} open Launch callback. @returns {HTMLElement} Explicit external actions. */
function actionRow(open) {
	const direct = createElement("a", {
		className: "button quiet shliach-direct",
		text: "Open Shliach ↗",
		attributes: { href: SHLIACH_URL, target: "_blank", rel: "noopener noreferrer" }
	});
	return createElement("div", {
		className: "shliach-actions",
		children: [actionButton("Send prompt to Shliach ↗", open, { className: "button primary" }), direct]
	});
}

/** @param {unknown} prompt User-authored prompt. @returns {Window|null} New browsing context when allowed. */
export function openShliach(prompt) {
	return globalThis.open?.(buildShliachUrl(prompt), "_blank", "noopener,noreferrer") || null;
}
