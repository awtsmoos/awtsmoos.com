//B"H
//Boruch Hashem
//Blessed be He

import { bindTetrisControls } from '../input/controls.js';
import { isCompatibleTetrisReady } from './build.js';
import { bindTetrisKeyboard } from '../input/keyboard.js';
import { HorizontalRepeatController } from '../input/horizontal-repeat.js';
import { bindSessionLifecycle } from './session-lifecycle.js';
import { TetrisSessionHost } from './session-host.js';
import { clearSessionStartupTimer, startSessionWorker } from './session-worker.js';

/**
 * @file session.js
 * @description Owns one page-side Tetris generation: immutable run identity, input/lifecycle bindings, Worker transport, pause intent, result projection, failure recovery, and disposal.
 * Awtsmoos.com makes Retry a genuinely fresh generation and marks disposed generations inert before releasing resources, so queued stale messages cannot mutate replacement UI.
 *
 * Architectural invariants:
 * - Exactly one immutable run ID belongs to one Session and one Worker transport.
 * - `disposed` is terminal for page-side message handling and semantic input.
 * - Failure and ordinary disposal both release every listener, timeout, held action, and Worker owned by this generation.
 * - Result truth remains Worker-owned; this session only validates generation identity and projects the frozen result.
 */
let sequence = 0;

export class TetrisSession extends TetrisSessionHost {
	constructor(options) {
		super();
		Object.assign(this, options);
		this.runId = `tetris:${Date.now()}:${++sequence}`;
		this.worker = null;
		this.workerStartupTimer = null;
		this.ready = false;
		this.completed = false;
		this.disposed = false;
		this.manualPause = false;
		this.disposers = [];
		this.inputBindings = [];
	}

	start() {
		if (this.disposed) {
			return false;
		}
		const canvases = this.view.freshCanvases(this.mode);
		this.disposers.push(bindSessionLifecycle(this));
		this.bindInput();
		this.disposers.push(startSessionWorker(this, canvases));
		this.view.setReady(false);
		return true;
	}

	bindInput() {
		const onAction = (action, value) => this.sendAction(action, value);
		const horizontalRepeat = new HorizontalRepeatController(
			direction => onAction('move', direction)
		);
		const controls = bindTetrisControls(this.view.controls, {
			onAction,
			horizontalRepeat
		});
		const keyboard = bindTetrisKeyboard({
			onAction,
			horizontalRepeat,
			onPause: () => this.togglePause()
		});
		this.inputBindings.push(controls, keyboard);
		this.disposers.push(
			controls.dispose,
			keyboard.dispose,
			() => horizontalRepeat.dispose()
		);
	}

	handleMessage(message) {
		if (this.disposed) {
			return;
		}
		if (message.runId && message.runId !== this.runId) {
			return;
		}
		if (message.type === 'ready') {
			clearSessionStartupTimer(this);
			if (!isCompatibleTetrisReady(message)) {
				this.fail('The Tikkun engine version does not match this page.');
				return;
			}
			this.ready = true;
			this.view.setReady(true);
			return;
		}
		if (this.completed) {
			return;
		}
		if (message.type === 'state') {
			this.view.updateSnapshot(message.snapshot);
			return;
		}
		if (message.type === 'pause_state') {
			this.view.setPaused(message.paused);
			return;
		}
		if (message.type === 'match_complete') {
			this.completed = true;
			this.view.setReady(false);
			this.reporter.report(message.result);
			this.view.showResult(message.result);
		}
	}
}
