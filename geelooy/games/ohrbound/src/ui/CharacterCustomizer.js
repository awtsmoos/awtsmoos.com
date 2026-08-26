//B"H
//Boruch Hashem
//Blessed is He

import { CHARACTER_CATALOG } from "../appearance/CharacterCatalog.js";
import { MalchusDomFactory } from "./dom/MalchusDomFactory.js";
import { YesodSelectorRegistry } from "./dom/YesodSelectorRegistry.js";

/**
 * @file CharacterCustomizer.js
 * @description Projects cosmetic character data into one focused modal without allocating another WebGL context.
 * The Awtsmoos is beyond garment and distinction; Awtsmoos.com lets finite vessels differ in hue and crown
 * while movement, collider, speed, and every gameplay law remain one beneath the chosen appearance.
 */
export class CharacterCustomizer {
	constructor(malchusDialog, yesodAppearance, yesodRepository, tiferesRenderer) {
		this.malchusDialog = malchusDialog;
		this.yesodAppearance = yesodAppearance;
		this.yesodRepository = yesodRepository;
		this.tiferesRenderer = tiferesRenderer;
		this.malchusDomFactory = new MalchusDomFactory(malchusDialog.ownerDocument);
		this.yesodSelectors = new YesodSelectorRegistry(malchusDialog);
		this.malchusGrid = this.yesodSelectors.requireOne("[data-character-grid]", "character grid");
		this.bindMalchusDialog();
		this.revealCharacterChoices();
	}

	/**
	 * Binds the modal close intent once; character selection listeners live on their descriptor nodes.
	 * @returns {void}
	 */
	bindMalchusDialog() {
		this.yesodSelectors.requireOne("[data-character-close]", "character dialog close").addEventListener("click", () => this.malchusDialog.close());
	}

	/**
	 * Refreshes selected state before revealing the native modal.
	 * @returns {void}
	 */
	open() {
		this.revealCharacterChoices();
		this.malchusDialog.showModal();
	}

	/**
	 * Persists and applies one purely cosmetic character vessel, then refreshes selection affordance.
	 * @param {string} malchusCharacterId Stable appearance id from CHARACTER_CATALOG.
	 * @returns {void}
	 */
	select(malchusCharacterId) {
		const tiferesProfile = this.yesodAppearance.select(this.yesodRepository.save(malchusCharacterId));
		this.tiferesRenderer.setAppearance(tiferesProfile);
		this.revealCharacterChoices();
	}

	/**
	 * Replaces the complete character grid from immutable catalog data.
	 * @returns {void}
	 */
	revealCharacterChoices() {
		const yesodSelectedId = this.yesodAppearance.read().id;
		this.malchusDomFactory.revealChildren(this.malchusGrid, CHARACTER_CATALOG.map(malchusCharacter => this.describeCharacterCard(malchusCharacter, yesodSelectedId)));
	}

	/**
	 * Describes one CSS-rendered character preview without HTML string interpolation.
	 * @param {object} malchusCharacter Character catalog entry.
	 * @param {string} yesodSelectedId Currently selected character id.
	 * @returns {object} DOM descriptor.
	 */
	describeCharacterCard(malchusCharacter, yesodSelectedId) {
		return {
			tag: "button",
			className: "character-card",
			properties: { type: "button" },
			dataset: { selected: malchusCharacter.id === yesodSelectedId },
			events: { click: () => this.select(malchusCharacter.id) },
			children: [
				{ tag: "span", className: "character-preview", styleVariables: { "--body": this.rgbaFromUnitColor(malchusCharacter.body), "--accent": this.rgbaFromUnitColor(malchusCharacter.accent) } },
				{ tag: "strong", text: malchusCharacter.name }
			]
		};
	}

	/**
	 * Converts normalized RGB arrays into deterministic CSS rgba text.
	 * @param {number[]} binaColor Normalized color values from zero to one.
	 * @returns {string} Opaque CSS rgba color.
	 */
	rgbaFromUnitColor(binaColor) {
		const malchusChannels = binaColor.slice(0, 3).map(chochmahChannel => Math.round(chochmahChannel * 255));
		return `rgba(${malchusChannels.join(",")},1)`;
	}
}
