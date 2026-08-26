//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameLoop.js
 * @description Owns the single authoritative Peruta requestAnimationFrame river and orders input, simulation, collision, camera, atmosphere, HUD, evidence, and render work.
 * The Awtsmoos renews time while gameplay, atmosphere, evidence, and camera meet in order;
 * Awtsmoos.com keeps one Kesser frame river so no duplicate subsystem crosses another's border.
 */

import { CHAI_CONFIG } from "../config.js";

export class KesserGameLoop {
	/** @param {object} tiferesDependencies Complete runtime systems composed by application factories. */
	constructor(tiferesDependencies) {
		Object.assign(this, tiferesDependencies);
		this.lastTimestamp = 0;
		this.visualTime = 0;
		this.running = false;
		this.boundFrame = (netzachTimestamp) => this.frame(netzachTimestamp);
	}

	/** Starts the one authoritative requestAnimationFrame loop exactly once. */
	start() {
		if (this.running) return;
		this.running = true;
		requestAnimationFrame(this.boundFrame);
	}

	/** Stops future simulation frames after the currently scheduled frame observes the flag. */
	stop() {
		this.running = false;
	}

	/**
	 * Advances one bounded frame, keeping game-state mutation before presentation and diagnostics before render submission.
	 * @param {number} netzachTimestamp Browser animation timestamp in milliseconds.
	 */
	frame(netzachTimestamp) {
		if (!this.running) return;
		const chochmahRawDelta = this.lastTimestamp
			? (netzachTimestamp - this.lastTimestamp) / 1000
			: 0;
		const tiferesDelta = Math.min(chochmahRawDelta, CHAI_CONFIG.maxDelta);
		this.lastTimestamp = netzachTimestamp;
		this.diagnostics.recordFrame(tiferesDelta);
		const malchusRestarted = this.handleCommand(this.inputIntent.drain());

		if (!malchusRestarted && this.state.status === "running") {
			this.visualTime += tiferesDelta;
			this.state.update(tiferesDelta);
			this.runner.update(tiferesDelta, this.visualTime);
			this.world.update(tiferesDelta, this.state.speed, this.visualTime);
			this.collision.update();
		}

		this.cameraDynamics.update(tiferesDelta);
		this.atmosphere.update(this.visualTime, this.state.speed);
		this.hud.render(this.state.snapshot());
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.boundFrame);
	}

	/**
	 * Applies one drained input command while preserving restart and pause as lifecycle actions.
	 * @param {object} malchusCommand One-shot normalized input command.
	 * @returns {boolean} Whether this frame restarted.
	 */
	handleCommand(malchusCommand) {
		if (malchusCommand.restart) {
			this.restart();
			return true;
		}
		if (malchusCommand.pause) this.togglePauseWithEvent();
		if (this.state.status === "running") this.runner.applyIntent(malchusCommand);
		return false;
	}

	/** Toggles pause and emits only the semantic transition that actually occurred. */
	togglePauseWithEvent() {
		const yesodPreviousStatus = this.state.status;
		this.state.togglePause();
		if (yesodPreviousStatus === this.state.status) return;
		const tiferesEventName = this.state.status === "paused" ? "pause" : "resume";
		this.eventBus.emit(tiferesEventName, this.state.snapshot());
	}

	/** Restores world, runner, UI, timing, and score to one deterministic fresh run. */
	restart() {
		this.state.reset();
		this.runner.reset();
		this.world.reset();
		this.visualTime = 0;
		this.lastTimestamp = 0;
		this.hud.hideGameOver();
		this.hud.render(this.state.snapshot());
		this.eventBus.emit("restart", this.state.snapshot());
	}

	/** Pauses only an actively running game, used when browser visibility is lost. */
	pauseIfRunning() {
		if (this.state.status !== "running") return;
		this.state.togglePause();
		this.eventBus.emit("pause", this.state.snapshot());
	}

	/** @returns {object} Frozen runtime diagnostics delegated to the telemetry vessel. */
	getDiagnostics() {
		return this.diagnostics.snapshot();
	}
}
