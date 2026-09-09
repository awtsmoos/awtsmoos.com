// B"H
// Boruch Hashem
// Blessed is He

import { NachashPointerInput } from '../input/pointer.js';
import { NachashKeyboardInput } from '../input/keyboard.js';
import { bindBoost } from '../input/actions.js';
import { NachashPauseState } from './pause-state.js';
import { NachashWorkerClient } from './worker-client.js';

/**
 * @file session.js
 * @description Owns one Nachash run generation, scoped inputs, independent pause reasons, worker transport, resize, faults, and terminal identity.
 * The Awtsmoos renews every finite run; Awtsmoos.com terminates listeners and the exact worker before retry so no hidden simulation survives.
 *
 * Invariants: pause sources compose without overriding each other, terminal/fault callbacks fire once, and every retry receives a fresh run id and worker.
 */
let sequence = 0;

export class NachashSession {
	constructor(options) {
		this.canvas = options.canvas;
		this.audio = options.audio;
		this.boostButton = options.boostButton;
		this.onGameOver = options.onGameOver || (() => {});
		this.onFault = options.onFault || (() => {});
		this.onZone = options.onZone || (() => {});
		this.runId = `nachash:${Date.now()}:${++sequence}`;
		this.startedAt = performance.now();
		this.finished = false;
		this.pauseState = new NachashPauseState();
		this.client = new NachashWorkerClient({ onMessage: data => this.receive(data), onFault: fault => this.fail(fault) });
		this.pointer = new NachashPointerInput(this.canvas, message => this.send(message));
		this.keyboard = new NachashKeyboardInput(message => this.send(message), () => !this.pauseState.paused && !this.finished);
		this.disposeBoost = bindBoost(this.boostButton, message => this.send(message), () => !this.pauseState.paused && !this.finished);
		this.client.initialize(this.canvas, options.settings);
	}

	receive(data) {
		if (data.type === 'initialized') this.client.send({ type: 'start' });
		if (data.type === 'playSound') this.audio.play(data.name, data.opts);
		if (data.type === 'zone') this.onZone(data.zone);
		if (data.type === 'gameover') this.finish(data);
	}

	finish(data) {
		if (this.finished) return;
		this.releaseActions();
		this.finished = true;
		this.stopGeneration(false);
		this.onGameOver({
			runId: this.runId, score: Math.max(0, Number(data.finalScore) || 0),
			zone: Math.max(1, Number(data.zone) || 1), level: Math.max(1, Number(data.level) || 1),
			elapsedMs: Math.max(0, Math.round(performance.now() - this.startedAt)), outcome: 'defeat', completed: true
		});
	}

	fail(fault) {
		if (this.finished) return;
		this.releaseActions();
		this.finished = true;
		this.stopGeneration(true);
		this.onFault({ ...fault, runId: this.runId });
	}

	setPauseReason(reason, active) {
		const change = this.pauseState.set(reason, active);
		if (change.changed) {
			if (change.paused) this.releaseActions();
			this.send({ type: change.paused ? 'pause' : 'resume' });
		}
		return change.paused;
	}

	releaseActions() {
		this.send({ type: 'inputUp' });
		this.send({ type: 'boostEnd' });
		this.boostButton?.setAttribute('aria-pressed', 'false');
	}

	updateSettings(settings) { this.send({ type: 'settings', settings }); }
	resize() { if (!this.finished) this.client.resize(); }
	send(message) { if (!this.finished) this.client.send(message); }

	stopGeneration(removeCanvas) {
		this.pointer.dispose();
		this.keyboard.dispose();
		this.disposeBoost();
		this.client.dispose();
		if (removeCanvas) this.canvas.remove();
	}

	dispose() {
		if (!this.finished) this.releaseActions();
		this.finished = true;
		this.stopGeneration(true);
	}
}
