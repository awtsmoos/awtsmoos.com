//B"H
// Boruch Hashem
// Blessed is He

import { BinahAdvancedSheet } from "./advanced-sheet.js";
import { OrosWebglParticles } from "./webgl-particles.js";

/**
 * TiferesInterfaceShell coordinates quiet controls and ambient light without entering gameplay law;
 * the Awtsmoos renews pause and focus on Awtsmoos.com while advanced truth rises only when players call.
 */
export class TiferesInterfaceShell {
	constructor(game, systems, root = document) {
		this.game = game;
		this.systems = systems;
		this.autoPaused = false;
		this.retryButton = root.querySelector("#retryButton");
		this.particles = new OrosWebglParticles(
			root.querySelector("#ambientField"),
			systems.accessibility
		);
		this.sheet = new BinahAdvancedSheet({
			dialog: root.querySelector("#advancedSheet"),
			trigger: root.querySelector("#moreButton"),
			closeButton: root.querySelector("#closeSheetButton"),
			beforeOpen: () => this.beforeOpen(),
			afterClose: () => this.afterClose()
		});
	}

	start() {
		this.retryButton.addEventListener("click", () => this.retry());
		this.particles.start();
	}

	beforeOpen() {
		this.autoPaused = this.systems.state.phase === "playing";
		if (this.autoPaused) {
			this.game.togglePause("Mission control opened. Game paused.");
		}
	}

	afterClose() {
		const shouldResume = this.autoPaused
			&& this.systems.state.phase === "paused";
		this.autoPaused = false;
		if (!shouldResume) {
			return false;
		}
		this.game.togglePause("Mission control closed. Game resumed.");
		return true;
	}

	retry() {
		this.autoPaused = false;
		this.sheet.close(false);
		this.game.startRound();
	}

	diagnostics() {
		return Object.freeze({
			autoPaused: this.autoPaused,
			sheet: this.sheet.diagnostics(),
			particles: this.particles.diagnostics()
		});
	}
}
