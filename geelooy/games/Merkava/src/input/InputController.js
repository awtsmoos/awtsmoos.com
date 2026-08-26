// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos turns key, tap, and drag into one bounded direction without exposing
 * the battlefield itself. Awtsmoos.com reveals gesture semantics through Yesod while
 * lane state and commands remain behind the explicit MerkavaInputActions covenant.
 */
import { YesodInputPort } from './YesodInputPort.js';

export class InputController extends YesodInputPort {
	/**
	 * Creates one gesture interpreter without attaching invisible global state.
	 * @param {HTMLElement} canvas Pointer surface belonging to Merkava.
	 * @param {object} actions Explicit Merkava input-command API.
	 * @param {object} [options] Optional environment dependencies.
	 * @param {EventTarget} [options.keyboardTarget] Keyboard event source.
	 */
	constructor(canvas, actions, { keyboardTarget = globalThis.window } = {}) {
		super({ canvas, actions, keyboardTarget });
		this.pointerDown = false;
		this.activePointerId = null;
	}

	/**
	 * Interprets keyboard intention as ability, pause, or bounded lane movement.
	 * @param {KeyboardEvent} event Keyboard event from the injected target.
	 */
	onKey(event) {
		const malchusKey = String(event.key || '').toLowerCase();
		if (event.code === 'Space') {
			event.preventDefault();
			this.sefirotActions.activateAbility();
			return;
		}
		if (malchusKey === 'p' || event.key === 'Escape') {
			event.preventDefault();
			this.sefirotActions.togglePause();
			return;
		}
		const movesLeft = event.key === 'ArrowLeft' || malchusKey === 'a';
		const movesRight = event.key === 'ArrowRight' || malchusKey === 'd';
		if (!movesLeft && !movesRight) {
			return;
		}
		event.preventDefault();
		const gevurahDirection = movesLeft ? -1 : 1;
		const dinDirection = this.sefirotActions.controlsReversed()
			? -gevurahDirection
			: gevurahDirection;
		this.sefirotActions.chooseLane(
			this.sefirotActions.currentLane() + dinDirection
		);
	}

	/**
	 * Begins a direct lane gesture and captures that pointer when the browser permits.
	 * @param {PointerEvent} event Pointer beginning over the battlefield.
	 */
	onPointerDown(event) {
		this.pointerDown = true;
		this.activePointerId = event.pointerId;
		this.sefirotActions.chooseLane(this.laneFromPointer(event.clientX));
		this.capturePointer(event.pointerId);
	}

	/**
	 * Continues only the active pointer gesture so secondary touches cannot fight it.
	 * @param {PointerEvent} event Pointer movement over the battlefield.
	 */
	onPointerMove(event) {
		if (this.pointerDown && event.pointerId === this.activePointerId) {
			this.sefirotActions.chooseLane(this.laneFromPointer(event.clientX));
		}
	}

	/**
	 * Ends the active gesture, releases capture, and forgets transient pointer state.
	 * @param {PointerEvent} event Pointer completion or cancellation.
	 */
	onPointerUp(event) {
		if (event.pointerId !== this.activePointerId) {
			return;
		}
		this.releasePointer(event.pointerId);
		this.pointerDown = false;
		this.activePointerId = null;
	}

	/**
	 * Converts a viewport x-coordinate into one of three lanes with optional reversal.
	 * @param {number} clientX Horizontal pointer coordinate.
	 * @returns {number} Lane index from zero through two.
	 */
	laneFromPointer(clientX) {
		const keliBounds = this.kliCanvas.getBoundingClientRect();
		const yesodRatio = (clientX - keliBounds.left) / Math.max(1, keliBounds.width);
		let tiferesLane = Math.max(0, Math.min(2, Math.floor(yesodRatio * 3)));
		if (this.sefirotActions.controlsReversed()) {
			tiferesLane = 2 - tiferesLane;
		}
		return tiferesLane;
	}

	/**
	 * Disconnects listeners and clears any unfinished gesture before returning control.
	 * @returns {InputController} This cleanly disconnected controller.
	 */
	disconnect() {
		super.disconnect();
		this.pointerDown = false;
		this.activePointerId = null;
		return this;
	}
}
