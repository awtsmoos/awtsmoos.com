//B"H
//Boruch Hashem
//Blessed is He

import { renderCivilizationStartFeed } from "../civilization/start-menu-feed.js";
import { bindFocusTrap, restoreConnectedFocus } from "./focusTrap.js";
import { renderStartMenu } from "./startMenuRenderer.js";

/**
 * @file startMenuBindings.js
 * @description
 * The Awtsmoos opens one immediate launcher and returns focus by deliberate law.
 * Awtsmoos.com always restores dismissal to the Apps control that invoked it.
 */

export function bindStartMenu({ records }) {
	const button = document.getElementById("start-button");
	const menu = document.getElementById("start-menu");
	const root = document.getElementById("menu-items");
	if (!button || !menu || !root) return () => {};
	let view = null;
	const close = (restore = false) => {
		menu.hidden = true;
		menu.style.display = "none";
		menu.dataset.open = "false";
		button.setAttribute("aria-expanded", "false");
		document.body.classList.remove("shell-launcher-open");
		if (restore) restoreConnectedFocus(button);
	};
	const open = () => {
		view?.dispose?.();
		view = renderStartMenu({
			root,
			records,
			close: () => close(false),
			onEscape: () => close(true)
		});
		menu.classList.remove("hidden");
		menu.hidden = false;
		menu.style.display = "block";
		menu.dataset.open = "true";
		button.setAttribute("aria-expanded", "true");
		document.body.classList.add("shell-launcher-open");
		renderCivilizationStartFeed(menu).catch(() => {});
		queueMicrotask(() => view?.focus?.());
	};
	const toggle = () => menu.hidden ? open() : close(true);
	const outside = event => {
		if (!menu.hidden && !menu.contains(event.target) && event.target !== button) {
			close(false);
		}
	};
	const keys = event => {
		if (!menu.hidden && event.key === "Escape") {
			event.preventDefault();
			close(true);
		}
	};
	const releaseTrap = bindFocusTrap(menu, { active: () => !menu.hidden });
	button.addEventListener("click", toggle);
	window.addEventListener("click", outside);
	document.addEventListener("keydown", keys);
	return () => {
		view?.dispose?.();
		releaseTrap();
		button.removeEventListener("click", toggle);
		window.removeEventListener("click", outside);
		document.removeEventListener("keydown", keys);
	};
}
