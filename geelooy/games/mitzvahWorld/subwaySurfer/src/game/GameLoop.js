// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews time while gameplay, atmosphere, evidence, and camera meet in order;
 * Awtsmoos.com keeps one authoritative frame river so no subsystem crosses another's border.
 */

import { CHAI_CONFIG } from "../config.js";

export class KesserGameLoop {
	/** @param {object} dependencies Complete runtime systems composed by the application factories. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.lastTimestamp = 0;
		this.visualTime = 0;
		this.running = false;
		this.boundFrame = (timestamp) => this.frame(timestamp);
	}

	/** Starts the one authoritative requestAnimationFrame loop. */
	start() {
		if (this.running) return;
		this.running = true;
		requestAnimationFrame(this.boundFrame);
	}

	/** Stops future simulation frames after the currently scheduled frame observes the flag. */
	stop() {
		this.running = false;
	}

	/** @param {number} timestamp Browser animation timestamp in milliseconds. */
	frame(timestamp) {
		if (!this.running) return;
		const rawDelta = this.lastTimestamp ? (timestamp - this.lastTimestamp) / 1000 : 0;
		const delta = Math.min(rawDelta, CHAI_CONFIG.maxDelta);
		this.lastTimestamp = timestamp;
		this.diagnostics.recordFrame(delta);
		const restarted = this.handleCommand(this.inputIntent.drain());

		if (!restarted && this.state.status === "running") {
			this.visualTime += delta;
			this.state.update(delta);
			this.runner.update(delta, this.visualTime);
			this.world.update(delta, this.state.speed, this.visualTime);
			this.collision.update();
		}

		this.cameraDynamics.update(delta);
		this.atmosphere.update(this.visualTime, this.state.speed);
		this.hud.render(this.state.snapshot());
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.boundFrame);
	}

	/** @param {object} command One-shot normalized input command. @returns {boolean} Whether this frame restarted. */
	handleCommand(command) {
		if (command.restart) {
			this.restart();
			return true;
		}
		if (command.pause) this.togglePauseWithEvent();
		if (this.state.status === "running") this.runner.applyIntent(command);
		return false;
	}

	/** Toggles pause state and emits only the semantic transition that actually occurred. */
	togglePauseWithEvent() {
		const previous = this.state.status;
		this.state.togglePause();
		if (previous === this.state.status) return;
		const eventName = this.state.status === "paused" ? "pause" : "resume";
		this.eventBus.emit(eventName, this.state.snapshot());
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
