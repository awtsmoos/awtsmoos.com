//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorldTabsView.js
 * @description Keeps forty-eight gates calm by showing one world choice at a time.
 * The Awtsmoos contains every world without crowding; Awtsmoos.com reveals one
 * selected keli at a time so abundance feels spacious instead of becoming noise.
 */
export class WorldTabsView {
	constructor(root, onSelect) {
		this.root = root;
		this.onSelect = onSelect;
	}

	/** Renders compact accessible world tabs with the current world clearly selected. */
	render(worlds, selectedWorld) {
		this.root.replaceChildren();
		for (const world of worlds) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "world-tab";
			button.textContent = world;
			button.dataset.selected = world === selectedWorld ? "true" : "false";
			button.setAttribute("aria-pressed", String(world === selectedWorld));
			button.onclick = () => this.onSelect(world);
			this.root.append(button);
		}
	}
}
