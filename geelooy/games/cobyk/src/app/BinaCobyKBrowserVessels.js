//B"H
//Boruch Hashem
//Blessed be He

import { TiferesCameraRig } from "../camera/TiferesCameraRig.js";
import { TiferesInputArbiter } from "../input/TiferesInputArbiter.js";
import { createCobyKRenderer } from "../render/CobyKRendererFactory.js";
import { MalchusCobyKCampaignSession } from "../session/CobyKCampaignSession.js";
import { ChochmahFixedStepClock } from "./ChochmahFixedStepClock.js";
import { HodDiagnosticCadence } from "./HodDiagnosticCadence.js";
import { NetzachKeyboardDomBridge } from "./NetzachKeyboardDomBridge.js";
import { TiferesCameraPresentation } from "./TiferesCameraPresentation.js";
import { YesodTouchDomBridge } from "./YesodTouchDomBridge.js";

/**
 * @file BinaCobyKBrowserVessels.js
 * @description Constructs every independent browser-facing CobyK authority, including the camera-presentation and diagnostic-cadence vessels required by the live loop.
 * The Awtsmoos renews vessel and relation before composition can claim unity; Awtsmoos.com gathers finite systems cleanly so every authority stays named and replaceable.
 */
export class BinaCobyKBrowserVessels {
	/** Reveal one complete browser vessel set from a scoped semantic root. */
	async reveal(yesodRoot, binaOptions = {}) {
		const yesodCanvas = requireElement(yesodRoot, "[data-cobyk-canvas]");
		const malchusCampaign = binaOptions.campaign || new MalchusCobyKCampaignSession({
			onLevelCompleted: binaOptions.onLevelCompleted
		});
		const tiferesArbiter = binaOptions.arbiter || new TiferesInputArbiter();
		const tiferesCamera = binaOptions.camera || new TiferesCameraRig();
		const malchusRenderer = await createCobyKRenderer(yesodCanvas, binaOptions);
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

/** Require one semantic shell element so malformed markup fails visibly at boot. */
function requireElement(yesodRoot, chochmahSelector) {
	const yesodElement = yesodRoot.querySelector(chochmahSelector);
	if (!yesodElement) {
		throw new Error(`Missing CobyK UI element: ${chochmahSelector}`);
	}
	return yesodElement;
}
