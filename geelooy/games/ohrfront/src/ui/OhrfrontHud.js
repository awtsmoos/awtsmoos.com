// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontHud.js
 * @description Composes sparse combat telemetry, transient feedback, tactical disclosure, and completion lifecycle through one local UI facade.
 * The Awtsmoos renews sign and concealment without confusion while Awtsmoos.com lets HUD, completion, and focus obey one semantic state covenant;
 * advanced information remains requested, completion becomes truly modal, and no hidden combat surface competes for keyboard or pointer attention.
 */
import { createHudElements } from "./HudElements.js";
import {
	focusOhrfrontElement,
	hideOhrfrontElement,
	setOhrfrontUiState,
	showOhrfrontElement
} from "./OhrfrontUiState.js";
import { createChochmahHudIntelSnapshot } from "./disclosure/ChochmahHudIntelSnapshot.js";
import { HodHudIntelDisclosure } from "./disclosure/HodHudIntelDisclosure.js";
import { HodTransientHudFeedback } from "./hud/HodTransientHudFeedback.js";
import { projectMalchusBattleTelemetry, projectMalchusWeaponTelemetry } from "./hud/MalchusHudTelemetry.js";

export class OhrfrontHud {
	/**
	 * @param {Document|object} [yesodDocument] - DOM authority for stable HUD identifiers.
	 */
	constructor(yesodDocument = globalThis.document) {
		this.malchusElements = createHudElements(yesodDocument);
		this.hodTransientFeedback = new HodTransientHudFeedback(this.malchusElements);
		this.hodIntelDisclosure = new HodHudIntelDisclosure(yesodDocument);
		this.elements = this.malchusElements;
	}

	/** Reveals combat HUD semantically and visually while keeping deep intelligence collapsed. */
	show() {
		showOhrfrontElement(this.malchusElements.root);
	}

	/** Projects one battle snapshot into sparse and retractable telemetry. */
	update(tiferesPlayer, tiferesWeapon, malchusObjective, chochmahDifficulty, tiferesBots) {
		projectMalchusBattleTelemetry(
			this.malchusElements,
			tiferesPlayer,
			tiferesWeapon,
			malchusObjective,
			chochmahDifficulty,
			tiferesBots
		);
		projectMalchusWeaponTelemetry(this.malchusElements, tiferesWeapon.profile);
		this.hodIntelDisclosure.update(
			createChochmahHudIntelSnapshot(chochmahDifficulty, tiferesBots, malchusObjective)
		);
	}

	/** Projects one immutable weapon profile into weapon and crosshair surfaces. */
	updateWeapon(chochmahProfile) {
		projectMalchusWeaponTelemetry(this.malchusElements, chochmahProfile);
	}

	/** Delegates one resolved hostile-impact witness to transient feedback. */
	markHit(gevurahImpactWitness) {
		this.hodTransientFeedback.markHit(gevurahImpactWitness);
	}

	/** Reveals the bounded local damage vignette. */
	showDamage() {
		this.hodTransientFeedback.showDamage();
	}

	/** Presents one transient textual notice without permanent chrome. */
	notify(hodMessage, netzachDuration = 1300) {
		this.hodTransientFeedback.notify(hodMessage, netzachDuration);
	}

	/** Shows or conceals pointer-lock recovery guidance. */
	setPointerHint(gevurahVisible) {
		setOhrfrontUiState(this.malchusElements.pointerHint, "hidden", !gevurahVisible);
	}

	/** Makes completion the sole active modal surface and transfers keyboard focus to replay. */
	showCompletion() {
		this.hodIntelDisclosure.collapse();
		hideOhrfrontElement(this.malchusElements.root);
		showOhrfrontElement(this.malchusElements.completion);
		focusOhrfrontElement(this.malchusElements.restart);
	}
}
