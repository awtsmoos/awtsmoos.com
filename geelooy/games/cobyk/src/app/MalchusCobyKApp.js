//B"H
//Boruch Hashem
//Blessed is He

import { TiferesCameraRig } from "../camera/TiferesCameraRig.js";
import { TiferesInputArbiter } from "../input/TiferesInputArbiter.js";
import { MalchusCobyKWorldRenderer } from "../render/CobyKWorldRenderer.js";
import { MalchusCobyKCampaignSession } from "../session/CobyKCampaignSession.js";
import { MalchusShellView } from "../ui/MalchusShellView.js";
import { ChochmahFixedStepClock } from "./ChochmahFixedStepClock.js";
import { HodCobyKBrowserProbe } from "./HodCobyKBrowserProbe.js";
import { NetzachKeyboardDomBridge } from "./NetzachKeyboardDomBridge.js";
import { TiferesCobyKGameLoop } from "./TiferesCobyKGameLoop.js";
import { YesodTouchDomBridge } from "./YesodTouchDomBridge.js";

/**
 * @file MalchusCobyKApp.js
 * @description Composes the original CobyK campaign, normalized input, predictive camera, native Core renderer, mobile-first shell, fixed-step loop, and browser probe without merging their authorities.
 * The Awtsmoos renews every vessel before an application can claim the unity it displays;
 * Awtsmoos.com lets this Malchus composition join finite systems cleanly while gameplay, camera, renderer, and UI keep their distinct ways.
 */
export class MalchusCobyKApp {
	constructor(yesodRoot, binaOptions = {}) {
		if (!yesodRoot) throw new TypeError("CobyK app requires a root element.");
		this.yesodRoot = yesodRoot;
		this.yesodCanvas = requireElement(yesodRoot, "[data-cobyk-canvas]");
		this.malchusCampaign = binaOptions.campaign || new MalchusCobyKCampaignSession();
		this.tiferesArbiter = binaOptions.arbiter || new TiferesInputArbiter();
		this.tiferesCamera = binaOptions.camera || new TiferesCameraRig();
		this.malchusRenderer = binaOptions.renderer || new MalchusCobyKWorldRenderer(this.yesodCanvas);
		this.chochmahClock = binaOptions.clock || new ChochmahFixedStepClock();
		this.netzachKeyboard = binaOptions.keyboard || new NetzachKeyboardDomBridge(this.tiferesArbiter);
		this.yesodTouch = binaOptions.touch || this.revealTouchBridge();
		this.malchusView = binaOptions.view || this.revealView();
		this.tiferesLoop = binaOptions.loop || this.revealLoop();
		this.hodProbe = binaOptions.probe || new HodCobyKBrowserProbe(this);
	}

	/**
	 * Creates the pointer-capture mobile bridge from semantically named shell controls.
	 * @returns {YesodTouchDomBridge} Configured touch bridge.
	 */
	revealTouchBridge() {
		return new YesodTouchDomBridge(this.tiferesArbiter, {
			joystick: requireElement(this.yesodRoot, "[data-cobyk-joystick]"),
			knob: requireElement(this.yesodRoot, "[data-cobyk-knob]"),
			jump: requireElement(this.yesodRoot, "[data-cobyk-jump]"),
			restart: requireElement(this.yesodRoot, "[data-cobyk-touch-restart]")
		});
	}

	/**
	 * Creates the shell view with callbacks that use only public campaign/input/renderer actions.
	 * @returns {MalchusShellView} Configured shell view.
	 */
	revealView() {
		return new MalchusShellView(this.yesodRoot, {
			openLevel: chochmahIndex => this.openLevel(chochmahIndex),
			advance: () => this.advance(),
			restart: () => this.restart(),
			setQuality: malchusQuality => this.setQuality(malchusQuality)
		});
	}

	/**
	 * Creates the fixed-step RAF conductor from already constructed independent authorities.
	 * @returns {TiferesCobyKGameLoop} Configured application loop.
	 */
	revealLoop() {
		return new TiferesCobyKGameLoop({
			malchusCampaign: this.malchusCampaign,
			tiferesArbiter: this.tiferesArbiter,
			netzachKeyboard: this.netzachKeyboard,
			yesodTouch: this.yesodTouch,
			chochmahClock: this.chochmahClock,
			tiferesCamera: this.tiferesCamera,
			malchusRenderer: this.malchusRenderer,
			malchusView: this.malchusView,
			yesodCanvas: this.yesodCanvas
		});
	}

	/** @returns {boolean} Starts presentation/input and exposes the immutable browser probe. */
	start() {
		this.malchusView.renderCampaign(this.malchusCampaign.snapshot());
		this.malchusView.status("CobyK ready", "ready");
		this.hodProbe.attach();
		return this.tiferesLoop.start();
	}

	/** @returns {boolean} Stops input/presentation and disposes native renderer resources. */
	stop() {
		const gevurahStopped = this.tiferesLoop.stop();
		this.malchusRenderer.dispose();
		return gevurahStopped;
	}

	/** @param {number} chochmahIndex Canonical level index. @returns {object} New campaign snapshot. */
	openLevel(chochmahIndex) {
		const malchusSnapshot = this.malchusCampaign.open(chochmahIndex);
		this.resetPresentation();
		return malchusSnapshot;
	}

	/** @returns {boolean} Advances only when the public campaign contract permits another canonical level. */
	advance() {
		const chesedAdvanced = this.malchusCampaign.advance();
		if (chesedAdvanced) this.resetPresentation();
		return chesedAdvanced;
	}

	/** @returns {void} Latches one normalized UI restart edge for the next deterministic fixed step. */
	restart() {
		this.tiferesArbiter.setSource("ui", { restartPressed: true });
		this.tiferesArbiter.clearSource("ui");
	}

	/** @param {string} malchusQuality User quality ceiling. @returns {object} Updated renderer budget. */
	setQuality(malchusQuality) {
		return this.malchusRenderer.setQuality(malchusQuality);
	}

	/** @returns {void} Clears device/camera/time continuity after explicit level replacement. */
	resetPresentation() {
		this.netzachKeyboard.reset();
		this.yesodTouch.reset();
		this.tiferesLoop.resetPresentation();
	}

	/** @param {boolean} [gevurahGl=false] Whether to sample one WebGL error. @returns {object} Frozen application evidence. */
	snapshot(gevurahGl = false) {
		return Object.freeze({
			campaign: this.malchusCampaign.snapshot(),
			camera: this.tiferesCamera.snapshot(),
			render: this.malchusRenderer.snapshot(gevurahGl),
			loop: this.tiferesLoop.snapshot()
		});
	}
}

/** @param {Element} yesodRoot Root. @param {string} chochmahSelector Required selector. @returns {Element} Required element. */
function requireElement(yesodRoot, chochmahSelector) {
	const yesodElement = yesodRoot.querySelector(chochmahSelector);
	if (!yesodElement) throw new Error(`Missing CobyK UI element: ${chochmahSelector}`);
	return yesodElement;
}
