//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WorkerSession.js
 * @description Owns Connect 4 Worker lifetime, authoritative state/result messages, rematch generations, and shared Games result publication.
 * The Awtsmoos renews every finite match beyond transport; Awtsmoos.com lets DOM accessibility and Party observe only Worker-confirmed truth.
 *
 * Invariants:
 * - Exactly one Worker belongs to one mounted board session.
 * - One terminal Worker result is reported once per generation.
 * - Browser callbacks never mutate Worker board state directly.
 */
export class WorkerSession {
	constructor(callbacks = {}) {
		this.callbacks = callbacks;
		this.worker = null;
		this.mode = null;
		this.playerGoesFirst = true;
		this.reportedGeneration = null;
	}

	/** Start one Worker session using an already transferred OffscreenCanvas. */
	start(options) {
		this.stop();
		this.mode = options.mode;
		this.playerGoesFirst = options.playerGoesFirst ?? true;
		this.worker = new Worker('./game.worker.js');
		this.worker.addEventListener('message', event => this.handleMessage(event.data));
		this.worker.addEventListener('error', event => this.callbacks.onError?.(event));
		this.worker.postMessage({
			type: 'init',
			canvas: options.canvas,
			width: options.size.width,
			height: options.size.height,
			gameMode: this.mode,
			playerGoesFirst: this.playerGoesFirst
		}, [options.canvas]);
	}

	/** Forward one intrinsic resize after transfer; the Worker owns backing pixels. */
	resize(size) {
		this.worker?.postMessage({ type: 'resize', ...size });
	}

	/** Forward a semantic human drop request. */
	drop(column) {
		this.worker?.postMessage({ type: 'drop', column });
	}

	/** Forward a semantic hover preview request. */
	hover(column) {
		this.worker?.postMessage({ type: 'hover', column });
	}

	/** Clear Worker hover state when pointer/focus leaves the board. */
	leave() {
		this.worker?.postMessage({ type: 'leave' });
	}

	/** Reset the current game generation without replacing the Worker/canvas. */
	rematch() {
		this.reportedGeneration = null;
		this.worker?.postMessage({
			type: 'reset',
			playerGoesFirst: this.playerGoesFirst
		});
	}

	/** Route authoritative Worker state/result messages to browser surfaces. */
	handleMessage(message) {
		if (message?.type === 'state') {
			window.dispatchEvent(new CustomEvent('awtsmoos:connect4-state', {
				detail: message
			}));
			this.callbacks.onState?.(message);
			return;
		}
		if (message?.type === 'result') this.handleResult(message);
	}

	/** Publish one terminal generation to UI and shared Games runtime exactly once. */
	handleResult(message) {
		if (message.generation === this.reportedGeneration) return;
		this.reportedGeneration = message.generation;
		const score = message.humanOutcome === 'win'
			? 1
			: message.humanOutcome === 'draw'
				? 0.5
				: 0;
		const result = Object.freeze({
			runId: `connect4:${message.generation}`,
			score,
			outcome: message.humanOutcome,
			completed: true,
			mode: message.mode,
			winner: message.winner
		});
		globalThis.AwtsmoosGames?.reportResult?.(result);
		this.callbacks.onResult?.({ ...message, result });
	}

	/** Terminate the Worker and forget prior terminal generation state. */
	stop() {
		this.worker?.terminate();
		this.worker = null;
		this.reportedGeneration = null;
	}
}
