//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorPointerSurface.js
 * @description Owns canvas listener lifetime and visual-frame hover coalescing while remaining ignorant of door geometry, state, prompts, and commands.
 * Yesod carries raw pointer pulses through one bounded vessel while Gevurah prevents high-frequency motion from multiplying expensive world questions;
 * the Awtsmoos recreates event and frame before either can race, and Awtsmoos.com keeps scheduling local so interaction APIs remain calm in every place.
 */

export class DoorPointerSurface {
	/**
	 * @description Creates a reusable listener surface around semantic hover and pointer-down callbacks supplied by the interaction coordinator.
	 * @param {(event:PointerEvent)=>void} onHover Callback receiving one coalesced mouse hover sample per visual frame.
	 * @param {(event:PointerEvent)=>void} onPointerDown Callback receiving pointer-down samples immediately for low-latency actions.
	 */
	constructor(onHover, onPointerDown) {
		this.onHover = onHover;
		this.onPointerDownAction = onPointerDown;
		this.canvas = null;
		this.camera = null;
		this.environment = globalThis;
		this.hoverFrame = null;
		this.pendingPointerEvent = null;
		this.onPointerMove = event => this.queueHover(event);
		this.onPointerDown = event => this.onPointerDownAction(event);
	}

	/**
	 * @description Claims one canvas/camera pair after fully releasing any previous listener and scheduling ownership.
	 * @param {HTMLCanvasElement} canvas Interactive render surface that receives pointer events.
	 * @param {object} camera Active world camera retained for interaction coordinator reads.
	 * @param {object} environment Browser-like scheduling environment containing requestAnimationFrame or timeout fallbacks.
	 * @returns {DoorPointerSurface} This listener surface for fluent installation.
	 */
	install(canvas, camera, environment = globalThis) {
		this.uninstall();
		this.canvas = canvas;
		this.camera = camera;
		this.environment = environment || globalThis;
		canvas.addEventListener('pointermove', this.onPointerMove, {
			passive: true
		});
		canvas.addEventListener('pointerdown', this.onPointerDown);
		return this;
	}

	/**
	 * @description Releases listeners and pending visual-frame work so remounting or destruction cannot leave hidden pointer ownership behind.
	 * @returns {void}
	 */
	uninstall() {
		if (this.canvas) {
			this.canvas.removeEventListener('pointermove', this.onPointerMove);
			this.canvas.removeEventListener('pointerdown', this.onPointerDown);
		}
		this.cancelHoverFrame();
		this.pendingPointerEvent = null;
		this.canvas = null;
		this.camera = null;
	}

	/**
	 * @description Retains only the newest mouse move and schedules one hover callback for the next display frame, ignoring touch/pen hover noise.
	 * @param {PointerEvent} event Raw pointer-move event from the installed surface.
	 * @returns {void}
	 */
	queueHover(event) {
		if (event.pointerType !== 'mouse') {
			return;
		}
		this.pendingPointerEvent = event;
		if (this.hoverFrame !== null) {
			return;
		}
		this.hoverFrame = this.requestFrame(() => {
			this.hoverFrame = null;
			const pointerEvent = this.pendingPointerEvent;
			this.pendingPointerEvent = null;
			if (pointerEvent) {
				this.onHover(pointerEvent);
			}
		});
	}

	/**
	 * @description Schedules one visual-frame callback with a bounded timer fallback when animation frames are unavailable.
	 * @param {FrameRequestCallback|Function} callback Callback invoked by the browser-like environment.
	 * @returns {*} Environment-specific scheduling handle.
	 */
	requestFrame(callback) {
		return this.environment.requestAnimationFrame?.(callback)
			?? this.environment.setTimeout?.(callback, 16)
			?? globalThis.setTimeout(callback, 16);
	}

	/**
	 * @description Cancels the currently retained hover-frame handle through both supported scheduling channels, then clears local ownership.
	 * @returns {void}
	 */
	cancelHoverFrame() {
		if (this.hoverFrame === null) {
			return;
		}
		this.environment.cancelAnimationFrame?.(this.hoverFrame);
		this.environment.clearTimeout?.(this.hoverFrame);
		this.hoverFrame = null;
	}
}
