//B"H
//Boruch Hashem
//Blessed be He

import { ADVENTURE_CONFIG } from "./config.js";
import { AdventureInput } from "./input.js";
import { AdventureMechanics } from "./mechanics.js";
import { AdventurePauseController } from "./pause-controller.js";
import { AdventureRenderer } from "./render.js";
import { AdventureResultReporter } from "./result-reporter.js";
import { AdventureRuntimeLoop } from "./runtime-loop.js";
import { AdventureUi } from "./ui.js";
import { AdventureWorld } from "./world.js";

/**
 * @file app.js
 * @description Composes Adventure's world, input, rendering, pause reasons, background-safe loop, semantic UI, and authoritative terminal result boundary.
 * The Awtsmoos joins finite systems without erasing their boundaries; Awtsmoos.com keeps this coordinator small so browser proof observes one living game rather than duplicate machinery.
 */
export class AdventureRuntime {
	constructor(canvas, documentRoot = document, browser = globalThis) {
		this.canvas = canvas;
		this.documentRoot = documentRoot;
		this.context = canvas.getContext("2d", { alpha: false });
		this.world = new AdventureWorld();
		this.mechanics = new AdventureMechanics(this.world);
		this.renderer = new AdventureRenderer(canvas, this.context);
		this.ui = new AdventureUi(documentRoot);
		this.pauseController = new AdventurePauseController(this.world);
		this.resultReporter = new AdventureResultReporter(browser);
		this.input = new AdventureInput(this.world, {
			onRestart: () => this.restart(),
			onPause: () => this.togglePause()
		});
		this.loop = new AdventureRuntimeLoop(() => this.step(), browser);
		this.handleVisibility = () => this.syncVisibility();
	}

	/** Begin one campaign run, visibility policy, and exactly one animation loop. */
	start() {
		this.canvas.width = ADVENTURE_CONFIG.worldWidth;
		this.canvas.height = ADVENTURE_CONFIG.worldHeight;
		this.resultReporter.begin();
		this.documentRoot.addEventListener("visibilitychange", this.handleVisibility);
		this.ui.render(this.world);
		const started = this.loop.start();
		this.syncVisibility();
		return started;
	}

	/** Advance one accepted visible frame through mechanics, rendering, UI, and result observation. */
	step() {
		this.mechanics.update();
		this.renderer.render(this.world);
		this.ui.render(this.world);
		this.resultReporter.observe(this.world);
	}

	/** Restart the complete run while preserving a currently hidden document as paused. */
	restart() {
		this.world.restart();
		this.pauseController.reset();
		if (this.documentRoot.hidden) this.pauseController.setBackground(true);
		this.resultReporter.begin();
		this.input.clear();
		this.ui.render(this.world);
	}

	/** Toggle only the player's pause reason; background pause remains independently authoritative. */
	togglePause() {
		if (["victory", "gameOver"].includes(this.world.status)) return this.world.status;
		this.pauseController.toggleUser();
		this.syncVisibility();
		return this.world.status;
	}

	/** Synchronize hidden-page pause and RAF suspension without changing deliberate user pause. */
	syncVisibility() {
		const hidden = Boolean(this.documentRoot.hidden);
		this.pauseController.setBackground(hidden);
		this.input.clear();
		const paused = this.pauseController.snapshot().paused;
		if (hidden || paused) this.loop?.suspend();
		else this.loop?.resume();
		this.ui.render(this.world);
	}

	/** Stop scheduling and release the visibility listener for deterministic teardown. */
	stop() {
		this.documentRoot.removeEventListener("visibilitychange", this.handleVisibility);
		this.input.clear();
		return this.loop.stop();
	}

	/** @returns {object} Frozen real-runtime witness consumed by cross-game browser audits. */
	snapshot() {
		return Object.freeze({
			...this.world.snapshot(),
			lifecycle: Object.freeze({
				loop: this.loop.snapshot(),
				pause: this.pauseController.snapshot(),
				result: this.resultReporter.snapshot()
			})
		});
	}
}

const canvas = document.getElementById("gameCanvas");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Adventure requires #gameCanvas.");

export const adventureRuntime = new AdventureRuntime(canvas);
globalThis.__ADVENTURE__ = Object.freeze({
	read: () => adventureRuntime.snapshot(),
	pause: () => adventureRuntime.togglePause(),
	restart: () => adventureRuntime.restart()
});
adventureRuntime.start();
