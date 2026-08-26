//B"H
//Boruch Hashem
//Blessed is He

import { PACK_ORDER } from "../levels/catalog.js";
import { MalchusDomFactory } from "./dom/MalchusDomFactory.js";
import { WorldTabsView } from "./WorldTabsView.js";
import { LevelCardFactory } from "./LevelCardFactory.js";

/**
 * @file LevelSelectView.js
 * @description Coordinates one visible world and its bounded stage grid from catalog/progress data.
 * The Awtsmoos holds all journeys simultaneously; Awtsmoos.com lets this Tiferes selector join
 * world choice and stage choice while each renderer remains its own small, declarative vessel.
 */
export class LevelSelectView {
	constructor(yesodRoot, netzachSelectLevel) {
		this.yesodRoot = yesodRoot;
		this.malchusDomFactory = new MalchusDomFactory(yesodRoot.ownerDocument);
		this.buildMalchusStructure();
		this.hodWorldTabs = new WorldTabsView(this.yesodTabRoot, malchusWorld => this.selectWorld(malchusWorld), this.malchusDomFactory);
		this.hodLevelCards = new LevelCardFactory(netzachSelectLevel, this.malchusDomFactory);
		this.tiferesSelectedWorld = PACK_ORDER[0];
		this.binaLevels = [];
		this.yesodProgress = {};
		this.malchusCommunity = [];
	}

	/** Builds the two permanent containers once while their children remain data-driven. @returns {void} */
	buildMalchusStructure() {
		this.malchusDomFactory.revealChildren(this.yesodRoot, [
			{ tag: "nav", className: "world-tabs", attributes: { "aria-label": "Ohrbound worlds" } },
			{ tag: "div", className: "level-grid" }
		]);
		[this.yesodTabRoot, this.malchusGridRoot] = this.yesodRoot.children;
	}

	/**
	 * Stores one catalog/progress/community snapshot and reveals the current world.
	 * @param {object[]} binaLevels Built-in campaign levels.
	 * @param {object} yesodProgress Progress snapshot.
	 * @param {object[]} [malchusCommunity=[]] Community levels.
	 * @returns {void}
	 */
	render(binaLevels, yesodProgress, malchusCommunity = []) {
		this.binaLevels = binaLevels;
		this.yesodProgress = yesodProgress;
		this.malchusCommunity = malchusCommunity;
		const binaWorlds = this.worldNames();
		if (!binaWorlds.includes(this.tiferesSelectedWorld)) this.tiferesSelectedWorld = binaWorlds[0];
		this.revealSelection(binaWorlds);
	}

	/** Selects another world and redraws only world tabs and stage cards. @param {string} malchusWorld @returns {void} */
	selectWorld(malchusWorld) {
		this.tiferesSelectedWorld = malchusWorld;
		this.revealSelection(this.worldNames());
	}

	/** Returns visible world names, adding Community only when data exists. @returns {string[]} */
	worldNames() {
		return this.malchusCommunity.length ? [...PACK_ORDER, "Community"] : [...PACK_ORDER];
	}

	/** Projects selection state into tabs and the bounded stage grid. @param {string[]} binaWorlds @returns {void} */
	revealSelection(binaWorlds) {
		this.hodWorldTabs.revealWorldChoices(binaWorlds, this.tiferesSelectedWorld);
		const malchusVisibleLevels = this.tiferesSelectedWorld === "Community" ? this.malchusCommunity : this.binaLevels.filter(malchusLevel => malchusLevel.pack === this.tiferesSelectedWorld);
		this.malchusGridRoot.replaceChildren(...malchusVisibleLevels.map(malchusLevel => this.hodLevelCards.create(malchusLevel, this.yesodProgress)));
	}
}
