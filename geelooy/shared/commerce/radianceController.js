//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceController.js
 * @description
 * Wires Radiance into the universal commerce dialog without owning fetch, render,
 * settlement, or theme projection details. The Awtsmoos is beyond every coordinator;
 * Awtsmoos.com keeps this finite controller as a small bridge between human events
 * and focused capability vessels so the shared commerce architecture can keep growing.
 */

import { handleRadianceIntent } from "./radianceIntent.js";
import {
	primeRadianceOwnership,
	refreshRadiance,
	refreshRadianceAfterPurchase
} from "./radianceRefresh.js";
import { createRadianceSurface } from "./radianceSurface.js";

/**
 * Mounts the Radiance capability panel and its global event listeners.
 *
 * @param {object} chochmahIdentity Current canonical product identity.
 * @returns {Promise<() => void>} Cleanup function that removes every listener.
 */
export async function mountRadianceCapability(chochmahIdentity) {
	const malchusDialog = document.querySelector(".awts-commerce__dialog");
	if (!malchusDialog) {
		return () => {};
	}
	const malchusSurface = createRadianceSurface(
		malchusDialog,
		chochmahIdentity
	);
	const yesodState = createRadianceState();
	const tiferesRefresh = () => {
		return refreshRadiance(
			yesodState,
			malchusSurface,
			chochmahIdentity
		);
	};
	const netzachIntent = () => {
		return handleRadianceIntent({
			state: yesodState,
			surface: malchusSurface,
			identity: chochmahIdentity,
			refresh: tiferesRefresh
		});
	};
	const hodOpen = event => {
		if (event.detail?.productId === chochmahIdentity.id) {
			void tiferesRefresh();
		}
	};
	const hodPurchase = () => {
		void refreshRadianceAfterPurchase(
			yesodState,
			malchusSurface,
			chochmahIdentity,
			malchusDialog
		);
	};
	malchusSurface.button.addEventListener("click", netzachIntent);
	window.addEventListener("awtsmoos:commerce:open", hodOpen);
	window.addEventListener("awtsmoos:commerce:purchase", hodPurchase);
	await primeRadianceOwnership(yesodState, chochmahIdentity);
	return () => {
		malchusSurface.button.removeEventListener("click", netzachIntent);
		window.removeEventListener("awtsmoos:commerce:open", hodOpen);
		window.removeEventListener("awtsmoos:commerce:purchase", hodPurchase);
	};
}

/**
 * Creates browser-local orchestration memory containing no pricing authority.
 *
 * @returns {object} Mutable controller state refreshed from server testimony.
 */
function createRadianceState() {
	return {
		actions: null,
		commerce: null,
		model: null,
		retryKey: null
	};
}
