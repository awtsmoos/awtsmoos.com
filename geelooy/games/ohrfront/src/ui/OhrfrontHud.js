// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontHud.js
 * @description Preserves the sparse HUD API while composing persistent telemetry, transient feedback, and retractable Hod combat intelligence.
 * The Awtsmoos renews sign, state, event, and witness without becoming divided by the finite surfaces that reveal them;
 * Awtsmoos.com lets advanced information remain requested rather than permanent while this facade keeps one simple historical update contract.
 */
import { createHudElements } from "./HudElements.js";
import { focusOhrfrontElement, setOhrfrontUiState, showOhrfrontElement } from "./OhrfrontUiState.js";
import { createChochmahHudIntelSnapshot } from "./disclosure/ChochmahHudIntelSnapshot.js";
import { HodHudIntelDisclosure } from "./disclosure/HodHudIntelDisclosure.js";
import { HodTransientHudFeedback } from "./hud/HodTransientHudFeedback.js";
import { projectMalchusBattleTelemetry, projectMalchusWeaponTelemetry } from "./hud/MalchusHudTelemetry.js";

export class OhrfrontHud {
	/**
	 * Creates the HUD facade around an injected document, resolving persistent elements and composing transient/retractable presentation vessels.
	 * @param {Document|object} [yesodDocument] - DOM authority used for all stable HUD and disclosure identifiers.
	 * @sideEffects Resolves DOM nodes, creates transient timers, and binds the INTEL disclosure's click/keyboard lifecycle.
	 */
	constructor(yesodDocument = globalThis.document) {
		this.malchusElements = createHudElements(yesodDocument);
		this.hodTransientFeedback = new HodTransientHudFeedback(this.malchusElements);
		this.hodIntelDisclosure = new HodHudIntelDisclosure(yesodDocument);
		this.elements = this.malchusElements;
	}

	/** Reveals the sparse combat HUD while leaving advanced INTEL collapsed until explicitly requested. */
	show() {
		showOhrfrontElement(this.malchusElements.root);
	}

	/**
	 * Projects one simulation snapshot into sparse telemetry, weapon identity, and the plain-data retractable INTEL surface.
	 * @param {object} tiferesPlayer - Player vitality authority.
	 * @param {object} tiferesWeapon - Player weapon facade.
	 * @param {object} malchusObjective - Objective authority.
	 * @param {object} chochmahDifficulty - Difficulty profile.
	 * @param {object} tiferesBots - Hostile authority exposing living count, kills, and finite reserves.
	 * @returns {void}
	 * @sideEffects Mutates HUD DOM presentation only; gameplay state remains authoritative elsewhere.
	 */
	update(tiferesPlayer, tiferesWeapon, malchusObjective, chochmahDifficulty, tiferesBots) {
		projectMalchusBattleTelemetry(this.malchusElements, tiferesPlayer, tiferesWeapon, malchusObjective, chochmahDifficulty, tiferesBots);
		projectMalchusWeaponTelemetry(this.malchusElements, tiferesWeapon.profile);
		this.hodIntelDisclosure.update(createChochmahHudIntelSnapshot(chochmahDifficulty, tiferesBots, malchusObjective));
	}

	/** Projects one immutable weapon profile into the visible sparse weapon and crosshair surfaces. */
	updateWeapon(chochmahProfile) {
		projectMalchusWeaponTelemetry(this.malchusElements, chochmahProfile);
	}

	/** Delegates one resolved hostile-impact witness to the transient Hod feedback timer vessel. */
	markHit(gevurahImpactWitness) {
		this.hodTransientFeedback.markHit(gevurahImpactWitness);
	}

	/** Reveals the bounded local damage vignette and replaces any previous clear timer. */
	showDamage() {
		this.hodTransientFeedback.showDamage();
	}

	/** Presents one transient textual notice without adding permanent HUD chrome. */
	notify(hodMessage, netzachDuration = 1300) {
		this.hodTransientFeedback.notify(hodMessage, netzachDuration);
	}

	/** Shows or conceals pointer-lock recovery guidance through namespaced local UI state only. */
	setPointerHint(gevurahVisible) {
		setOhrfrontUiState(this.malchusElements.pointerHint, "hidden", !gevurahVisible);
	}

	/** Collapses advanced INTEL, reveals completion, and schedules focus on replay without viewport scrolling. */
	showCompletion() {
		this.hodIntelDisclosure.collapse();
		showOhrfrontElement(this.malchusElements.completion);
		focusOhrfrontElement(this.malchusElements.restart);
	}
}
