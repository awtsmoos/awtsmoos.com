//B"H
//Boruch Hashem
//Blessed be He

import { createInstances } from './instance-factory.js';
import { applyInput, resizeInstances } from './instance-routing.js';
import { resolvePendingMatch } from './match-completion.js';
import { disposeRuntime, disposeRuntimeGeneration, runRuntimeFrame, scheduleRuntime, setRuntimePaused } from './runtime-cycle.js';

/**
 * @file WorkerRuntime.js
 * @description Owns one Tetris Worker generation: board ownership, frame cadence, pause, resize, semantic input, terminal arbitration, and disposal.
 * Awtsmoos.com keeps callbacks generation-scoped and resolves terminal truth only after complete simulation work units, preventing order-dependent match outcomes.
 *
 * Architectural invariants:
 * - Initialization owns every board before the first spawn can publish terminal state.
 * - Paused or completed generations own no scheduled frame and consume no decorative frame budget.
 * - Resume resets board clocks before scheduling exactly one new frame.
 * - Stale run IDs are rejected before any gameplay mutation.
 */
export class WorkerRuntime {
	constructor(scope = self) {
		this.scope = scope;
		this.instances = [];
		this.frameHandle = null;
		this.runId = '';
		this.mode = '';
		this.paused = false;
		this.completed = false;
		this.pendingCompletion = false;
		this.startedAt = 0;
		this.loop = timestamp => runRuntimeFrame(this, timestamp);
	}

	init(payload = {}) {
		disposeRuntimeGeneration(this);
		this.runId = String(payload.runId || '');
		this.mode = payload.mode || 'single';
		this.startedAt = performance.now();
		this.paused = false;
		this.completed = false;
		this.pendingCompletion = false;
		this.instances = createInstances(
			payload,
			message => this.handleInstanceMessage(message)
		);
		for (const instance of this.instances) {
			instance.start();
		}
		resolvePendingMatch(this);
		if (this.completed) {
			return;
		}
		this.scope.postMessage({ type: 'ready', runId: this.runId });
		scheduleRuntime(this);
	}

	command(message = {}) {
		if (message.runId && message.runId !== this.runId) {
			return;
		}
		if (message.type === 'pause') {
			setRuntimePaused(this, true);
			return;
		}
		if (message.type === 'resume') {
			setRuntimePaused(this, false);
			return;
		}
		if (message.type === 'resize') {
			resizeInstances(this.instances, message.payload);
			return;
		}
		if (message.type === 'input' && !this.paused && !this.completed) {
			const player = this.instances.find(instance => instance.id === 1 && !instance.isAI);
			if (player) {
				applyInput(player, message.payload);
				resolvePendingMatch(this);
			}
		}
	}

	handleInstanceMessage(message) {
		this.scope.postMessage({
			...message,
			runId: this.runId
		});
		if (message.type === 'game_over') {
			this.pendingCompletion = true;
		}
	}

	dispose() {
		disposeRuntime(this);
	}
}
