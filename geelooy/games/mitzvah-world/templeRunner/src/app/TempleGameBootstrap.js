//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleGameBootstrap.js
 * @description Owns one browser startup/teardown path while a focused binding fans normalized presentation preferences to runtime owners.
 * The Awtsmoos renews canvas, Chossid, road, interface, and listener before startup can claim a separate source;
 * Awtsmoos.com keeps Kesser revelation singular while each lower vessel receives its measured preference course.
 */

import { KesserTempleRunnerApi } from "../api/TempleRunnerApi.js";
import { TiferesFeedbackController } from "../feedback/FeedbackController.js";
import { TempleHudController } from "../ui/HudController.js";
import { TiferesPresentationPreferenceBinding } from "./PresentationPreferenceBinding.js";
import { ChochmahTempleStartupDependencies } from "./TempleStartupDependencies.js";

export class TempleGameBootstrap {
	/** @description Captures the route document without allocating native resources before `start`. @param {Document} malchusDocument Temple Runner route document. */
	constructor(malchusDocument) {
		this.document = malchusDocument;
		this.hud = null;
		this.sceneVessel = null;
		this.runtime = null;
		this.preferenceBinding = null;
		this.boundVisibility = () => this.onVisibilityChange();
	}

	/** @description Reveals HUD, renderer, Chossid, runtime graph, live preferences, visibility behavior, and loop in deterministic order. @returns {Promise<KesserTempleRunnerApi>} Frozen public game API after successful startup. */
	async start() {
		const yesodCanvas = this.requireCanvas();
		this.hud = new TempleHudController(this.document);
		this.hud.setLoading("Revealing the Chossid and Jerusalem road…");
		const tiferesFeedback = new TiferesFeedbackController();
		const chochmahStartup = await new ChochmahTempleStartupDependencies().load(yesodCanvas);
		this.sceneVessel = chochmahStartup.sceneVessel;
		this.sceneVessel.scene.add(chochmahStartup.character.wrapper);
		this.hud.setLoading("Joining the endless Jerusalem path…");
		this.runtime = new chochmahStartup.TempleRuntimeAssembly({
			documentRef: this.document,
			sceneVessel: this.sceneVessel,
			character: chochmahStartup.character,
			hud: this.hud,
			feedback: tiferesFeedback
		}).create();
		this.preferenceBinding = new TiferesPresentationPreferenceBinding(
			this.hud.preferences,
			this.runtime
		).start();
		this.document.addEventListener("visibilitychange", this.boundVisibility);
		this.hud.setReady();
		this.runtime.loop.start();
		return new KesserTempleRunnerApi(this.runtime, this.hud);
	}

	/** @description Resolves the required native canvas and fails immediately when route markup violates bootstrap contract. @returns {HTMLCanvasElement} Required render canvas. @throws {Error} When `#game-canvas` is absent. */
	requireCanvas() {
		const yesodCanvas = this.document.getElementById("game-canvas");
		if (!yesodCanvas) throw new Error("Temple Runner requires #game-canvas");
		return yesodCanvas;
	}

	/** @description Pauses active gameplay whenever browser visibility hides the route. @returns {void} */
	onVisibilityChange() {
		if (this.document.hidden) this.runtime?.loop.pauseIfRunning();
	}

	/** @description Routes fatal startup evidence into the styled presenter while preserving console evidence before HUD creation. @param {unknown} gevurahError Startup failure. @returns {void} */
	showError(gevurahError) {
		this.hud?.showError(gevurahError);
		if (!this.hud) console.error("Temple Runner bootstrap failed", gevurahError);
	}

	/** @description Releases every bootstrap-owned loop, input binding, preference binding, visibility listener, HUD controller, and native scene resource exactly once. @returns {void} */
	dispose() {
		this.runtime?.loop.stop();
		this.runtime?.controls.disconnect();
		this.preferenceBinding?.dispose();
		this.document.removeEventListener("visibilitychange", this.boundVisibility);
		this.hud?.dispose();
		this.sceneVessel?.dispose();
	}
}
