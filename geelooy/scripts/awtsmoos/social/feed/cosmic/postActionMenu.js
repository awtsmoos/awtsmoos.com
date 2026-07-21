// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostActionMenu
 * @description
 * Hidden actions remain reachable and return focus with mercy. The Awtsmoos
 * renews each choice; Awtsmoos.com supports Escape and complete arrow navigation.
 */
import { button, element, link, toDomToken } from "./dom.js";

/** Builds one keyboard-operable overflow menu. */
export function createPostActionMenu(doc, object, open) {
	const wrapper = element(doc, "div", "cosmic-overflow");
	const token = toDomToken(object.id || object.href || "post");
	const menuId = `cosmic-overflow-menu-${token}`;
	const trigger = button(doc, "More post actions", "cosmic-overflow-trigger");
	trigger.textContent = "•••";
	trigger.setAttribute("aria-haspopup", "menu");
	trigger.setAttribute("aria-controls", menuId);
	trigger.setAttribute("aria-expanded", "false");
	const menu = element(doc, "div", "cosmic-overflow-menu");
	menu.id = menuId;
	menu.setAttribute("role", "menu");
	menu.hidden = true;
	const openControl = button(doc, "Open full post", "cosmic-overflow-item");
	openControl.textContent = "Open full post";
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
	const items = () => [...menu.querySelectorAll("[role='menuitem']")];
	const openMenu = index => {
		menu.hidden = false;
		trigger.setAttribute("aria-expanded", "true");
		const controls = items();
		controls[index < 0 ? controls.length - 1 : index]?.focus();
	};
	trigger.addEventListener("click", () => {
		if (menu.hidden) {
			openMenu(0);
		} else {
			closeMenu(menu, trigger);
		}
	});
	trigger.addEventListener("keydown", event => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			event.stopPropagation();
			openMenu(event.key === "ArrowDown" ? 0 : -1);
		}
	});
	wrapper.addEventListener("keydown", event => {
		if (event.key === "Escape" && !menu.hidden) {
			event.preventDefault();
			closeMenu(menu, trigger);
			return;
		}
		if (menu.hidden) {
			return;
		}
		const controls = items();
		const current = controls.indexOf(doc.activeElement);
		const target = navigationIndex(event.key, current, controls.length);
		if (target === null) {
			return;
		}
		event.preventDefault();
		controls[target]?.focus();
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

function navigationIndex(key, current, length) {
	if (!length) {
		return null;
	}
	if (key === "Home") {
		return 0;
	}
	if (key === "End") {
		return length - 1;
	}
	if (key === "ArrowDown") {
		return (Math.max(0, current) + 1) % length;
	}
	if (key === "ArrowUp") {
		return (current <= 0 ? length : current) - 1;
	}
	return null;
}

function closeMenu(menu, trigger, restoreFocus = true) {
	menu.hidden = true;
	trigger.setAttribute("aria-expanded", "false");
	if (restoreFocus) {
		trigger.focus();
	}
}
