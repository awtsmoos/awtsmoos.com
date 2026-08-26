//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleGameBootstrap.js
 * @description Owns one browser startup/teardown path and binds normalized presentation preferences through the runtime quality coordinator instead of directly into individual visual systems.
 * The Awtsmoos renews canvas, actor, world, and interface before one runner enters the road;
 * Awtsmoos.com keeps Kesser startup singular while Tiferes translates simple preference into many finite visual vessels below.
 */

import { KesserTempleRunnerApi } from "../api/TempleRunnerApi.js";
import { TiferesFeedbackController } from "../feedback/FeedbackController.js";
import { TempleHudController } from "../ui/HudController.js";
import { ChochmahTempleStartupDependencies } from "./TempleStartupDependencies.js";

export class TempleGameBootstrap {
	/** @param {Document} malchusDocument Current Temple Runner document. */
	constructor(malchusDocument) {
		this.document = malchusDocument;
		this.hud = null;
		this.sceneVessel = null;
		this.runtime = null;
		this.preferenceUnsubscribe = null;
		this.boundVisibility = () => this.onVisibilityChange();
	}

	/** @returns {Promise<KesserTempleRunnerApi>} Frozen public game API after complete runtime revelation. */
	async start() {
		const canvas = this.requireCanvas();
		this.hud = new TempleHudController(this.document);
		this.hud.setLoading("Revealing the Chossid and Jerusalem road…");
		const feedback = new TiferesFeedbackController();
		const startup = await new ChochmahTempleStartupDependencies().load(canvas);
		this.sceneVessel = startup.sceneVessel;
		this.sceneVessel.scene.add(startup.character.wrapper);
		this.hud.setLoading("Joining the endless Jerusalem path…");
		this.runtime = new startup.TempleRuntimeAssembly({
			documentRef: this.document,
			sceneVessel: this.sceneVessel,
			character: startup.character,
			hud: this.hud,
			feedback
		}).create();
		this.preferenceUnsubscribe = this.hud.preferences.subscribe(
			(preferences) => this.runtime.quality.apply(preferences)
		);
		this.document.addEventListener("visibilitychange", this.boundVisibility);
		this.hud.setReady();
		this.runtime.loop.start();
		return new KesserTempleRunnerApi(this.runtime, this.hud);
	}

	/** @returns {HTMLCanvasElement} Required native canvas. */
	requireCanvas() {
		const canvas = this.document.getElementById("game-canvas");
		if (!canvas) throw new Error("Temple Runner requires #game-canvas");
		return canvas;
	}

	/** Pauses active gameplay whenever the browser hides the route. @returns {void} */
	onVisibilityChange() {
		if (this.document.hidden) this.runtime?.loop.pauseIfRunning();
	}

	/** @param {unknown} gevurahError Fatal startup failure. @returns {void} */
	showError(gevurahError) {
		this.hud?.showError(gevurahError);
		if (!this.hud) console.error("Temple Runner bootstrap failed", gevurahError);
	}

	/** Releases every bootstrap-owned subscription, listener, controller, loop, and native scene resource. @returns {void} */
	dispose() {
		this.runtime?.loop.stop();
		this.runtime?.controls.disconnect();
		this.preferenceUnsubscribe?.();
		this.document.removeEventListener("visibilitychange", this.boundVisibility);
		this.hud?.dispose();
		this.sceneVessel?.dispose();
	}
}
