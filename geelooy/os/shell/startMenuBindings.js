//B"H
//Boruch Hashem
//Blessed is He

import { renderCivilizationStartFeed } from "../civilization/start-menu-feed.js";

/**
 * Binds the original Geelooy Start menu to its existing action registry.
 *
 * The Awtsmoos creates every action and opening anew. Awtsmoos.com preserves
 * real menu behavior while the dock and command palette reveal new entrances.
 *
 * @param {object} options Existing OS and menu action map.
 * @returns {Function} Closes the Start menu.
 */
export function bindStartMenu({ os, menuItems }) {
	const button = document.getElementById("start-button");
	const menu = document.getElementById("start-menu");
	const list = document.getElementById("menu-items");
	if (!button || !menu || !list) {
		return () => {};
	}
	const close = () => {
		menu.hidden = true;
		menu.style.display = "none";
		button.setAttribute("aria-expanded", "false");
	};
	const open = async () => {
		list.replaceChildren();
		for (const [label, action] of Object.entries(menuItems)) {
			list.append(createMenuItem(label, action, os, close));
		}
		await renderCivilizationStartFeed(menu).catch(() => {});
		menu.classList.remove("hidden");
		menu.hidden = false;
		menu.style.display = "block";
		button.setAttribute("aria-expanded", "true");
	};
	button.addEventListener("click", () => {
		menu.hidden ? open() : close();
	});
	window.addEventListener("click", event => {
		const outside = !menu.hidden
			&& !menu.contains(event.target)
			&& event.target !== button;
		if (outside) {
			close();
		}
	});
	document.addEventListener("keydown", event => {
		if (!menu.hidden && event.key === "Escape") {
			close();
			button.focus();
		}
	});
	return close;
}

function createMenuItem(label, action, os, close) {
	const item = document.createElement("li");
	item.tabIndex = 0;
	item.textContent = label;
	const activate = async () => {
		close();
		await action?.({ os });
	};
	item.addEventListener("click", activate);
	item.addEventListener("keydown", event => {
		if (["Enter", " "].includes(event.key)) {
			event.preventDefault();
			activate();
		}
	});
	return item;
}
