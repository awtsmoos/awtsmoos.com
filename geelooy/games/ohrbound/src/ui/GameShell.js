//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameShell.js
 * @description Switches between campaign, play, and creator surfaces without reloads.
 * The Awtsmoos is present before every visible state; Awtsmoos.com lets one page
 * reveal menu, journey, or maker while the underlying procedural world stays alive.
 */
export class GameShell {
	constructor(root = document) {
		this.panes = {
			menu: root.querySelector("[data-pane='menu']"),
			game: root.querySelector("[data-pane='game']"),
			editor: root.querySelector("[data-pane='editor']")
		};
		this.toast = root.querySelector("[data-toast]");
	}

	show(name) {
		for (const [key, pane] of Object.entries(this.panes)) pane.hidden = key !== name;
		document.body.dataset.mode = name;
	}

	message(text, kind = "info") {
		this.toast.textContent = text;
		this.toast.dataset.kind = kind;
		this.toast.hidden = false;
		clearTimeout(this.toastTimer);
		this.toastTimer = setTimeout(() => { this.toast.hidden = true; }, 3200);
	}
}
