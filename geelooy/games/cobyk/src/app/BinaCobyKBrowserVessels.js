//B"H
//Boruch Hashem
//Blessed is He

import { TiferesCameraRig } from "../camera/TiferesCameraRig.js";
import { TiferesInputArbiter } from "../input/TiferesInputArbiter.js";
import { MalchusCobyKWorldRenderer } from "../render/CobyKWorldRenderer.js";
import { MalchusCobyKCampaignSession } from "../session/CobyKCampaignSession.js";
import { ChochmahFixedStepClock } from "./ChochmahFixedStepClock.js";
import { HodDiagnosticCadence } from "./HodDiagnosticCadence.js";
import { NetzachKeyboardDomBridge } from "./NetzachKeyboardDomBridge.js";
import { TiferesCameraPresentation } from "./TiferesCameraPresentation.js";
import { YesodTouchDomBridge } from "./YesodTouchDomBridge.js";

/**
 * @file BinaCobyKBrowserVessels.js
 * @description Constructs the independent browser-facing CobyK authorities and adapters while leaving application actions/lifecycle to the higher Malchus coordinator.
 * The Awtsmoos renews vessel and relation before composition can claim the unity it reveals;
 * Awtsmoos.com lets this Bina factory gather finite systems cleanly so each authority remains named, replaceable, and easy to heal.
 */
export class BinaCobyKBrowserVessels {
	/**
	 * Reveals one complete browser vessel set from a scoped semantic CobyK root and optional test/runtime overrides.
	 * @param {Element} yesodRoot Scoped CobyK application root.
	 * @param {object} [binaOptions={}] Optional authority/adapter overrides.
	 * @returns {object} Frozen browser vessel set.
	 */
	reveal(yesodRoot, binaOptions = {}) {
		const yesodCanvas = requireElement(yesodRoot, "[data-cobyk-canvas]");
		const malchusCampaign = binaOptions.campaign || new MalchusCobyKCampaignSession();
		const tiferesArbiter = binaOptions.arbiter || new TiferesInputArbiter();
		const tiferesCamera = binaOptions.camera || new TiferesCameraRig();
		const malchusRenderer = binaOptions.renderer || new MalchusCobyKWorldRenderer(yesodCanvas);
		const chochmahClock = binaOptions.clock || new ChochmahFixedStepClock();
		const hodCadence = binaOptions.cadence || new HodDiagnosticCadence();
		const netzachKeyboard = binaOptions.keyboard || new NetzachKeyboardDomBridge(tiferesArbiter);
		const yesodTouch = binaOptions.touch || new YesodTouchDomBridge(tiferesArbiter, {
			joystick: requireElement(yesodRoot, "[data-cobyk-joystick]"),
			knob: requireElement(yesodRoot, "[data-cobyk-knob]"),
			jump: requireElement(yesodRoot, "[data-cobyk-jump]"),
			restart: requireElement(yesodRoot, "[data-cobyk-touch-restart]")
		});
		const tiferesCameraPresentation = binaOptions.cameraPresentation || new TiferesCameraPresentation(
			tiferesCamera,
			yesodCanvas
		);
		return Object.freeze({
			yesodCanvas,
			malchusCampaign,
			tiferesArbiter,
			tiferesCamera,
			malchusRenderer,
			chochmahClock,
			hodCadence,
			netzachKeyboard,
			yesodTouch,
			tiferesCameraPresentation
		});
	}
}

/**
 * Requires one semantic shell element so malformed HTML fails at boot with an exact selector rather than becoming a partially styled page.
 * @param {Element} yesodRoot Scoped app root.
 * @param {string} chochmahSelector Required selector.
 * @returns {Element} Required element.
 */
function requireElement(yesodRoot, chochmahSelector) {
	const yesodElement = yesodRoot.querySelector(chochmahSelector);
	if (!yesodElement) {
		throw new Error(`Missing CobyK UI element: ${chochmahSelector}`);
	}
	return yesodElement;
}
