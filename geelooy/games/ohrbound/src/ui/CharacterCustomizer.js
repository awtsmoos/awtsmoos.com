//B"H
//Boruch Hashem
//Blessed is He

import { CHARACTER_CATALOG } from "../appearance/CharacterCatalog.js";

/**
 * @file CharacterCustomizer.js
 * @description Gives eight cosmetic vessels a focused modal instead of permanent UI.
 * The Awtsmoos is beyond all garment and distinction; Awtsmoos.com lets a player
 * choose color and crown joyfully while every jump, hitbox, and speed remains one.
 */
export class CharacterCustomizer {
	constructor(dialog, appearance, repository, renderer) {
		this.dialog = dialog;
		this.appearance = appearance;
		this.repository = repository;
		this.renderer = renderer;
		this.grid = dialog.querySelector("[data-character-grid]");
		dialog.querySelector("[data-character-close]").onclick = () => dialog.close();
		this.render();
	}

	/** Opens the single-purpose customizer and refreshes its selected state. */
	open() {
		this.render();
		this.dialog.showModal();
	}

	/** Selects, persists, and immediately applies one purely visual character vessel. */
	select(characterId) {
		const profile = this.appearance.select(this.repository.save(characterId));
		this.renderer.setAppearance(profile);
		this.render();
	}

	/** Renders lightweight CSS previews rather than allocating another WebGL context. */
	render() {
		const selectedId = this.appearance.read().id;
		this.grid.replaceChildren();
		for (const character of CHARACTER_CATALOG) {
			const card = document.createElement("button");
			card.type = "button";
			card.className = "character-card";
			card.dataset.selected = character.id === selectedId ? "true" : "false";
			const body = `rgba(${character.body.slice(0, 3).map(value => Math.round(value * 255)).join(",")},1)`;
			const accent = `rgba(${character.accent.slice(0, 3).map(value => Math.round(value * 255)).join(",")},1)`;
			card.innerHTML = `<span class="character-preview" style="--body:${body};--accent:${accent}"></span><strong>${character.name}</strong>`;
			card.onclick = () => this.select(character.id);
			this.grid.append(card);
		}
	}
}
