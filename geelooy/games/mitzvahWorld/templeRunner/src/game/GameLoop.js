// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameLoop.js
 * @description Owns the single browser heartbeat, canonical input order, presentation updates, diagnostics cadence, and native render.
 * The Awtsmoos renews each instant before command, motion, camera, and light can become one frame;
 * Awtsmoos.com keeps the heartbeat narrow while lifecycle and Daas guard ending and evidence by name.
 */

import { RUNNER_CONFIG } from "../config.js";
import { DaasRuntimeDiagnostics } from "../runtime/RuntimeDiagnostics.js";
import { TiferesRunFrameUpdater } from "./RunFrameUpdater.js";

export class TempleGameLoop {
	/** @param {object} dependencies Complete authoritative runtime systems. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.frameUpdater = new TiferesRunFrameUpdater(dependencies);
		this.diagnostics = new DaasRuntimeDiagnostics(dependencies);
		this.lastTimestamp = 0;
		this.visualTime = 0;
		this.diagnosticsTime = 0;
		this.running = false;
		this.boundFrame = (timestamp) => this.frame(timestamp);
	}

	/** Starts the one authoritative animation heartbeat. */
	start() {
		if (this.running) return;
		this.running = true;
		requestAnimationFrame(this.boundFrame);
	}

	/** Stops future animation work without mutating run state. */
	stop() {
		this.running = false;
	}

	/** @param {number} timestamp Browser animation timestamp. */
	frame(timestamp) {
		if (!this.running) return;
		const delta = this.frameDelta(timestamp);
		this.gamepad.update();
		const restarted = this.handleCommand(this.input.drain());
		if (!restarted && this.state.status === "running") {
			this.visualTime += delta;
			this.frameUpdater.update(delta, this.visualTime);
			this.camera.update(delta);
			this.effects.update(
				delta,
				this.state.speed,
				this.world.currentDistrict()
			);
		}
		this.lifecycle.observeStatus();
		const snapshot = this.snapshots.compose();
		this.hud.render(snapshot, this.world.turnPrompt());
		this.updateDiagnostics(delta);
		this.sceneVessel.render(this.visualTime);
		requestAnimationFrame(this.boundFrame);
	}

	/** @param {number} timestamp Browser timestamp. @returns {number} Clamped frame seconds. */
	frameDelta(timestamp) {
		const rawDelta = this.lastTimestamp
			? (timestamp - this.lastTimestamp) / 1000
			: 0;
		this.lastTimestamp = timestamp;
		return Math.min(rawDelta, RUNNER_CONFIG.maxDelta);
	}

	/** @param {object} command Normalized one-frame command. @returns {boolean} Whether restart consumed the frame. */
	handleCommand(command) {
		if (command.restart) {
			this.restart();
			return true;
		}
		if (command.pause) {
			this.state.togglePause();
		}
		if (this.state.status !== "running") return false;
		const filtered = this.world.consumeDirection(command);
		if (this.state.status === "running") {
			this.runner.applyIntent(filtered);
		}
		return false;
	}

	/** Restores all per-run systems through Kesser lifecycle. */
	restart() {
		this.lifecycle.restart();
		this.visualTime = 0;
		this.diagnosticsTime = 0;
		this.lastTimestamp = 0;
	}

	/** Pauses an active run when browser visibility disappears. */
	pauseIfRunning() {
		this.lifecycle.pauseIfRunning();
	}

	/** @returns {object} Unified gameplay snapshot. */
	getSnapshot() {
		return this.snapshots.compose();
	}

	/** @returns {object} Compact advanced runtime evidence. */
	getDiagnostics() {
		return this.diagnostics.snapshot();
	}

	/** @param {number} delta Frame seconds. */
	updateDiagnostics(delta) {
		this.diagnosticsTime += delta;
		if (this.diagnosticsTime < 0.5) return;
		this.diagnosticsTime = 0;
		this.hud.setDiagnostics(this.getDiagnostics());
	}
}
