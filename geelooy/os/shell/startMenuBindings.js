//B"H
//Boruch Hashem
//Blessed is He

import { renderCivilizationStartFeed } from "../civilization/start-menu-feed.js";
import { renderStartMenu } from "./startMenuRenderer.js";

/**
 * @file startMenuBindings.js
 * @description
 * The Awtsmoos opens one searchable launcher above every native and inherited deed.
 * Awtsmoos.com preserves outside-click, Escape, focus, and Civilization feed behavior.
 */

export function bindStartMenu({ records }) {
	const button = document.getElementById("start-button");
	const menu = document.getElementById("start-menu");
	const root = document.getElementById("menu-items");
	if (!button || !menu || !root) {
		return () => {};
	}
	let view = null;
	const close = () => {
		menu.hidden = true;
		menu.style.display = "none";
		button.setAttribute("aria-expanded", "false");
	};
	const open = async () => {
		view?.dispose?.();
		view = renderStartMenu({ root, records, close });
		await renderCivilizationStartFeed(menu).catch(() => {});
		menu.classList.remove("hidden");
		menu.hidden = false;
		menu.style.display = "block";
		button.setAttribute("aria-expanded", "true");
		queueMicrotask(() => view?.focus?.());
	};
	const toggle = () => menu.hidden ? open() : close();
	const outside = event => {
		if (!menu.hidden && !menu.contains(event.target) && event.target !== button) {
			close();
		}
	};
	const keys = event => {
		if (!menu.hidden && event.key === "Escape") {
			event.preventDefault();
			close();
			button.focus();
		}
	};
	button.addEventListener("click", toggle);
	window.addEventListener("click", outside);
	document.addEventListener("keydown", keys);
	return () => {
		view?.dispose?.();
		button.removeEventListener("click", toggle);
		window.removeEventListener("click", outside);
		document.removeEventListener("keydown", keys);
	};
}
