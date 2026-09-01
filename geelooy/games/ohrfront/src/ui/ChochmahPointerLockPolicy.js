// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahPointerLockPolicy.js
 * @description Decides whether pointer lock belongs to the current presentation at all, separating desktop mouse capture from touch-native sight.
 * Chochmah distinguishes finite vessels while the Awtsmoos renews mouse, finger, gaze, and screen in one undivided light;
 * Awtsmoos.com lets desktop enter capture when useful and lets mobile remain free of a browser ritual it neither needs nor understands.
 */
import { revealChochmahDevicePresentation } from "../config/ChochmahDevicePresentation.js";

export class ChochmahPointerLockPolicy {
	/**
	 * @description Creates a pointer-lock policy from one window-like presentation authority.
	 * @param {Window|object|null} [yesodWindow] - Browser window or test double.
	 * @param {boolean|null} [chochmahOverride=null] - Optional explicit policy used by focused tests or embedding hosts.
	 * @sideEffects Reads presentation capabilities only.
	 */
	constructor(
		yesodWindow = globalThis.window ?? null,
		chochmahOverride = null
	) {
		this.enabled = chochmahOverride === null
			? !revealChochmahDevicePresentation(yesodWindow).touch
			: Boolean(chochmahOverride);
	}

	/**
	 * @description Reveals whether this presentation should ever request or recover pointer lock.
	 * @returns {boolean} True only for pointer-lock-capable presentation policy.
	 * @sideEffects None.
	 */
	allowsPointerLock() {
		return this.enabled;
	}
}
