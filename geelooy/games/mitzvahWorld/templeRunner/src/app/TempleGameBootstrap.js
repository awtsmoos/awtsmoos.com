// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleGameBootstrap.js
 * @description Owns the one startup path while renderer, Chossid, and full gameplay graph reveal concurrently behind the minimal shell.
 * The Awtsmoos renews canvas, actor, world, and interface before one runner enters the road;
 * Awtsmoos.com keeps startup singular yet parallel, so no hidden assembly makes the first browser breath carry every load.
 */

import { KesserTempleRunnerApi } from "../api/TempleRunnerApi.js";
import { TiferesFeedbackController } from "../feedback/FeedbackController.js";
import { TempleHudController } from "../ui/HudController.js";
import { ChochmahTempleStartupDependencies } from "./TempleStartupDependencies.js";

export class TempleGameBootstrap {
	/** @param {Document} documentRef Current game document. */
	constructor(documentRef) {
		this.document = documentRef;
		this.hud = null;
		this.sceneVessel = null;
		this.runtime = null;
		this.preferenceUnsubscribe = null;
		this.boundVisibility = () => this.onVisibilityChange();
	}

	/** @returns {Promise<KesserTempleRunnerApi>} Frozen public game API. */
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
			(preferences) => this.runtime.effects.setPreferences(preferences)
		);
		this.document.addEventListener(
			"visibilitychange",
			this.boundVisibility
		);
		this.hud.setReady();
		this.runtime.loop.start();
		return new KesserTempleRunnerApi(this.runtime, this.hud);
	}

	/** @returns {HTMLCanvasElement} Required native canvas. */
	requireCanvas() {
		const canvas = this.document.getElementById("game-canvas");
		if (!canvas) {
			throw new Error("Temple Runner requires #game-canvas");
		}
		return canvas;
	}

	/** Pauses active gameplay when the browser page becomes hidden. */
	onVisibilityChange() {
		if (this.document.hidden) {
			this.runtime?.loop.pauseIfRunning();
		}
	}

	/** @param {unknown} error Fatal startup failure. */
	showError(error) {
		this.hud?.showError(error);
		if (!this.hud) {
			console.error("Temple Runner bootstrap failed", error);
		}
	}

	/** Releases route-owned browser/runtime listeners and renderer resources. */
	dispose() {
		this.runtime?.loop.stop();
		this.runtime?.controls.disconnect();
		this.preferenceUnsubscribe?.();
		this.document.removeEventListener(
			"visibilitychange",
			this.boundVisibility
		);
		this.hud?.dispose();
		this.sceneVessel?.dispose();
	}
}
