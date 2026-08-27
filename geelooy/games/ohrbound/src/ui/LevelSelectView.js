//B"H
//Boruch Hashem
//Blessed is He

import { PACK_ORDER } from "../levels/catalog.js";
import { WorldTabsView } from "./WorldTabsView.js";
import { LevelCardFactory } from "./LevelCardFactory.js";

/**
 * @file LevelSelectView.js
 * @description Reveals one six-stage world at a time instead of a forty-eight-card wall.
 * The Awtsmoos holds all journeys simultaneously; Awtsmoos.com gives attention a
 * quieter keli where one world may shine while the others remain one tap away.
 */
export class LevelSelectView {
	constructor(root, onSelect) {
		this.root = root;
		this.tabRoot = document.createElement("nav");
		this.gridRoot = document.createElement("div");
		this.tabRoot.className = "world-tabs";
		this.gridRoot.className = "level-grid";
		this.root.append(this.tabRoot, this.gridRoot);
		this.tabs = new WorldTabsView(this.tabRoot, world => this.selectWorld(world));
		this.cards = new LevelCardFactory(onSelect);
		this.selectedWorld = PACK_ORDER[0];
	}

	/** Stores the latest catalog/progress snapshot and redraws only the active world. */
	render(levels, progress, community = []) {
		this.levels = levels;
		this.progress = progress;
		this.community = community;
		const worlds = community.length ? [...PACK_ORDER, "Community"] : [...PACK_ORDER];
		if (!worlds.includes(this.selectedWorld)) this.selectedWorld = worlds[0];
		this.tabs.render(worlds, this.selectedWorld);
		this.renderGrid();
	}

	/** Changes the visible world without creating another screen or page transition. */
	selectWorld(world) {
		this.selectedWorld = world;
		const worlds = this.community.length ? [...PACK_ORDER, "Community"] : [...PACK_ORDER];
		this.tabs.render(worlds, world);
		this.renderGrid();
	}

	/** Renders six authored stages, or the bounded community collection, into one grid. */
	renderGrid() {
		this.gridRoot.replaceChildren();
		const visible = this.selectedWorld === "Community"
			? this.community
			: this.levels.filter(level => level.pack === this.selectedWorld);
		for (const level of visible) {
			this.gridRoot.append(this.cards.create(level, this.progress));
		}
	}
}
