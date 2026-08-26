// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodTransientHudFeedback.js
 * @description Owns bounded timers and namespaced transient HUD states for hit, damage, and notification communication.
 * Hod gives finite events a brief readable echo while the Awtsmoos remains beyond impact, message, appearance, and disappearance;
 * Awtsmoos.com keeps timer lifecycle separate from telemetry projection so fleeting feedback cannot contaminate persistent HUD data flow.
 */
import { setOhrfrontUiState, showOhrfrontElement } from "../OhrfrontUiState.js";

export class HodTransientHudFeedback {
	/**
	 * Creates a transient-feedback vessel around resolved HUD elements.
	 * @param {object} malchusElements - HUD element map containing hit marker, vignette, and notification nodes.
	 * @sideEffects Initializes timer handles only.
	 */
	constructor(malchusElements) {
		this.malchusElements = malchusElements;
		this.netzachHitTimer = null;
		this.netzachDamageTimer = null;
		this.netzachNotificationTimer = null;
	}

	/**
	 * Reveals the appropriate impact symbol for a short bounded interval.
	 * @param {object} gevurahImpactWitness - Impact data carrying defeated/shieldHit facts.
	 * @returns {void}
	 * @sideEffects Updates marker text/state and replaces the prior hit timer.
	 */
	markHit(gevurahImpactWitness) {
		const hodMarker = this.malchusElements.hitMarker;
		hodMarker.textContent = gevurahImpactWitness?.defeated ? "✦" : gevurahImpactWitness?.shieldHit ? "◇" : "◆";
		setOhrfrontUiState(hodMarker, "active", true);
		clearTimeout(this.netzachHitTimer);
		const netzachDuration = gevurahImpactWitness?.defeated ? 150 : 80;
		this.netzachHitTimer = setTimeout(() => setOhrfrontUiState(hodMarker, "active", false), netzachDuration);
	}

	/**
	 * Reveals and automatically clears the local damage vignette.
	 * @returns {void}
	 * @sideEffects Replaces the previous damage timer and toggles namespaced active state.
	 */
	showDamage() {
		setOhrfrontUiState(this.malchusElements.damageVignette, "active", true);
		clearTimeout(this.netzachDamageTimer);
		this.netzachDamageTimer = setTimeout(
			() => setOhrfrontUiState(this.malchusElements.damageVignette, "active", false),
			150
		);
	}

	/**
	 * Presents one transient textual message for a caller-defined bounded duration.
	 * @param {string} hodMessage - Human-readable notification text.
	 * @param {number} [netzachDuration] - Display duration in milliseconds.
	 * @returns {void}
	 * @sideEffects Replaces notification text, reveals it, and replaces the previous notification timer.
	 */
	notify(hodMessage, netzachDuration = 1300) {
		const hodNotification = this.malchusElements.notification;
		hodNotification.textContent = hodMessage;
		showOhrfrontElement(hodNotification);
		clearTimeout(this.netzachNotificationTimer);
		this.netzachNotificationTimer = setTimeout(
			() => setOhrfrontUiState(hodNotification, "hidden", true),
			netzachDuration
		);
	}
}
