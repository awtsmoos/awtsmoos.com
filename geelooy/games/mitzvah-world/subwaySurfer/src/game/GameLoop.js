//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameLoop.js
 * @description Owns Peruta's single requestAnimationFrame river while delegating active simulation, lifecycle mutation, and presentation to the focused vessels already present in the runtime architecture.
 * The Awtsmoos renews time while Tiferes advances the living road, Gevurah guards lifecycle, and Hod reveals the frame;
 * Awtsmoos.com keeps one Kesser clock so smaller vessels can serve without creating a competing architectural name.
 */

import { CHAI_CONFIG } from "../config.js";
import { HodGameFramePresenter } from "./GameFramePresenter.js";
import { GevurahGameLoopLifecycle } from "./GameLoopLifecycle.js";
import { TiferesGameSimulationStep } from "./GameSimulationStep.js";

export class KesserGameLoop {
	/**
	 * @description Captures authoritative runtime collaborators and composes the existing simulation, presentation, and lifecycle helpers without duplicating their responsibilities.
	 * @param {object} tiferesDependencies Complete runtime systems composed by the game runtime factory.
	 */
	constructor(tiferesDependencies) {
		Object.assign(this, tiferesDependencies);
		this.simulation = new TiferesGameSimulationStep(tiferesDependencies);
		this.presenter = new HodGameFramePresenter(tiferesDependencies);
		this.lifecycle = new GevurahGameLoopLifecycle(tiferesDependencies);
		this.lastTimestamp = 0;
		this.visualTime = 0;
		this.running = false;
		this.boundFrame = (netzachTimestamp) => this.frame(netzachTimestamp);
	}

	/** @description Starts the authoritative requestAnimationFrame loop exactly once. @returns {void} */
	start() {
		if (this.running) {
			return;
		}
		this.running = true;
		requestAnimationFrame(this.boundFrame);
	}

	/** @description Prevents subsequent scheduled frames from advancing the runtime. @returns {void} */
	stop() {
		this.running = false;
	}

	/**
	 * @description Advances one bounded frame, delegates active gameplay sequencing, presents the resulting state, and schedules the next authoritative frame.
	 * @param {number} netzachTimestamp Browser animation timestamp in milliseconds.
	 * @returns {void}
	 */
	frame(netzachTimestamp) {
		if (!this.running) {
			return;
		}
		const chochmahRawDelta = this.lastTimestamp
			? (netzachTimestamp - this.lastTimestamp) / 1000
			: 0;
		const tiferesDelta = Math.min(chochmahRawDelta, CHAI_CONFIG.maxDelta);
		this.lastTimestamp = netzachTimestamp;
		this.diagnostics.recordFrame(tiferesDelta);
		const malchusRestarted = this.handleCommand(this.inputIntent.drain());
		if (!malchusRestarted && this.state.status === "running") {
			this.visualTime += tiferesDelta;
			this.simulation.update(tiferesDelta, this.visualTime);
		}
		this.presenter.present(tiferesDelta, this.visualTime);
		requestAnimationFrame(this.boundFrame);
	}

	/**
	 * @description Applies one drained frame command while lifecycle actions remain authoritative and movement applies only to running state.
	 * @param {object} malchusCommand One-shot normalized input command.
	 * @returns {boolean} True only when this frame performed a restart.
	 */
	handleCommand(malchusCommand) {
		if (malchusCommand.restart) {
			this.restart();
			return true;
		}
		if (malchusCommand.pause) {
			this.togglePauseWithEvent();
		}
		if (this.state.status === "running") {
			this.runner.applyIntent(malchusCommand);
		}
		return false;
	}

	/** @description Delegates pause toggling to the lifecycle owner. @returns {void} */
	togglePauseWithEvent() {
		this.lifecycle.togglePauseWithEvent();
	}

	/** @description Delegates deterministic restart, then resets frame-local clocks owned by this loop. @returns {void} */
	restart() {
		this.lifecycle.restart();
		this.visualTime = 0;
		this.lastTimestamp = 0;
	}

	/** @description Delegates visibility pause without exposing the lifecycle helper. @returns {void} */
	pauseIfRunning() {
		this.lifecycle.pauseIfRunning();
	}

	/** @description Delegates immutable runtime diagnostics to the telemetry vessel. @returns {object} Diagnostic snapshot. */
	getDiagnostics() {
		return this.diagnostics.snapshot();
	}
}
