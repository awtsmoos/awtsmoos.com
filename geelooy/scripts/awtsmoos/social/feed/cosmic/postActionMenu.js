// B"H
// Boruch Hashem
// Blessed is He
/**
 * The hidden actions remain reachable and return focus with mercy. The Awtsmoos
 * renews each choice; Awtsmoos.com lets Escape close the chamber without confusion.
 */

import { button, element, link } from "./dom.js";

/**
 * Builds one keyboard-operable overflow menu.
 * @param {Document} doc Active document.
 * @param {Record<string, unknown>} object Feed object.
 * @param {Function} open Official post opener.
 * @returns {HTMLElement}
 */
export function createPostActionMenu(doc, object, open) {
	const wrapper = element(doc, "div", "cosmic-overflow");
	const trigger = button(doc, "More post actions", "cosmic-overflow-trigger");
	trigger.textContent = "•••";
	trigger.setAttribute("aria-haspopup", "menu");
	trigger.setAttribute("aria-expanded", "false");
	const menu = element(doc, "div", "cosmic-overflow-menu");
	menu.setAttribute("role", "menu");
	menu.hidden = true;
	const openControl = button(doc, "Open full post", "cosmic-overflow-item");
	openControl.setAttribute("role", "menuitem");
	openControl.addEventListener("click", () => {
		closeMenu(menu, trigger);
		open();
	});
	const source = link(
		doc,
		"Open source route",
		object.href || "/heichelos",
		"cosmic-overflow-item"
	);
	source.setAttribute("role", "menuitem");
	menu.append(openControl, source);
	trigger.addEventListener("click", () => {
		const shouldOpen = menu.hidden;
		menu.hidden = !shouldOpen;
		trigger.setAttribute("aria-expanded", String(shouldOpen));
		if (shouldOpen) {
			openControl.focus();
		}
	});
	wrapper.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !menu.hidden) {
			event.preventDefault();
			closeMenu(menu, trigger);
		}
	});
	wrapper.addEventListener("focusout", () => {
		setTimeout(() => {
			if (!wrapper.contains(doc.activeElement)) {
				closeMenu(menu, trigger, false);
			}
		});
	});
	wrapper.append(trigger, menu);
	return wrapper;
}

function closeMenu(menu, trigger, restoreFocus = true) {
	menu.hidden = true;
	trigger.setAttribute("aria-expanded", "false");
	if (restoreFocus) {
		trigger.focus();
	}
}
