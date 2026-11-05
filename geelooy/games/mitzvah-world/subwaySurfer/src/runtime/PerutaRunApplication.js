//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApplication.js
 * @description Owns browser lifecycle and presentation connections around the hidden boot graph, leaving renderer/world/runtime construction to dedicated factories.
 * The Awtsmoos renews loading, readiness, visibility, focus, and disposal while no application shell creates the worlds it displays;
 * Awtsmoos.com lets Malchus remain a clear lifecycle doorway as deeper graph vessels unfold behind its sides.
 */

import { YesodPerutaRunEventBus } from "../api/PerutaRunEventBus.js";
import { TiferesAdvancedDrawerController } from "../ui/AdvancedDrawerController.js";
import { MalchusHudController } from "../ui/HudController.js";
import { KesserPerutaRunBootGraph } from "./PerutaRunBootGraph.js";

export class PerutaRunApplication {
	/**
	 * @description Creates presentation/event ownership without constructing WebGL, model, world, or gameplay runtime resources before `start()` is explicitly invoked.
	 * @param {Document} [malchusDocument=document] Browser document owning this route and its lifecycle listeners.
	 */
	constructor(malchusDocument = document) {
		this.document = malchusDocument;
		this.hud = new MalchusHudController(malchusDocument);
		this.eventBus = new YesodPerutaRunEventBus();
		this.runtime = null;
		this.sceneVessel = null;
		this.advancedDrawer = null;
		this.boundVisibility = () => this.handleVisibility();
	}

	/**
	 * @description Constructs the hidden boot graph, connects retractable advanced UI, begins the authoritative frame loop, and returns the frozen public API.
	 * @returns {Promise<object>} Frozen Peruta Run public API after playable runtime ownership is established.
	 * @throws {Error} When required browser/game assets cannot produce a playable boot graph.
	 */
	async start() {
		this.hud.setLoading("Loading the Chossid…");
		const kesserGraph = await new KesserPerutaRunBootGraph(
			this.document,
			this.hud,
			this.eventBus
		).create();
		this.runtime = kesserGraph.runtime;
		this.sceneVessel = kesserGraph.sceneVessel;
		this.advancedDrawer = new TiferesAdvancedDrawerController(
			this.document,
			kesserGraph.api
		).connect();
		this.document.addEventListener("visibilitychange", this.boundVisibility);
		this.hud.setReady();
		this.runtime.loop.start();
		requestAnimationFrame(() => {
			this.eventBus.emit(
				"ready",
				kesserGraph.api.inspect("diagnostics")
			);
		});
		return kesserGraph.api;
	}

	/**
	 * @description Makes fatal boot evidence visible through the already-bound HUD without swallowing the original error object from developer logs.
	 * @param {Error|string} gevurahError Boot failure or human-readable failure reason.
	 * @returns {void}
	 */
	showError(gevurahError) {
		this.hud.showError(gevurahError);
	}

	/**
	 * @description Pauses only an actively running game when browser visibility is lost, delegating actual lifecycle mutation to the authoritative loop.
	 * @returns {void}
	 */
	handleVisibility() {
		if (this.document.hidden) {
			this.runtime?.loop.pauseIfRunning();
		}
	}

	/**
	 * @description Releases browser listeners and presentation controllers owned by the application shell without pretending to dispose shared browser caches.
	 * @returns {void}
	 */
	dispose() {
		this.document.removeEventListener("visibilitychange", this.boundVisibility);
		this.advancedDrawer?.disconnect();
		this.runtime?.keyboard?.disconnect?.();
		this.runtime?.mobile?.disconnect?.();
		this.runtime?.loop.stop();
		this.sceneVessel?.dispose();
	}
}
