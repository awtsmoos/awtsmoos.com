// B"H
// Boruch Hashem
// Blessed is He

import { bindKabbalahActions } from '../input/action-bindings.js';
import { KabbalahActionState } from '../input/action-state.js';
import { updateKabbalahControlStatus } from '../input/control-status.js';

/**
 * @file input_system.js
 * @description Owns gameplay Pointer Events and visible Shield/Time bindings while delegating semantic actions to the Game façade.
 * The Awtsmoos renews movement and intention; Awtsmoos.com confines pointer prevention to the canvas and gives every listener an explicit teardown path.
 *
 * Invariants:
 * - Time never implies firing and one pointer owns aim at a time.
 * - Pause/dispose forcibly releases held semantic actions.
 * - Menus, player-shell gestures, and browser controls remain outside this system.
 */
export class InputSystem {
	constructor(game, surface, controls = {}) {
		if (!surface) throw new Error('kabbalah_input_surface_required');
		this.game = game;
		this.surface = surface;
		this.timeButton = controls.timeButton || null;
		this.state = new KabbalahActionState();
		this.controls = controls;
		this.disposers = [];
		this.bindSurface();
		this.disposers.push(bindKabbalahActions({
			shieldButton: controls.shieldButton,
			timeButton: controls.timeButton,
			onShield: () => this.game.activateShield(),
			onTime: held => this.setTimeHeld(held),
			isEnabled: () => this.game.isPlaying && !this.game.isPaused && !this.game.runState.completed
		}));
	}

	/** Bind non-passive Pointer Events only to the visual gameplay surface. */
	bindSurface() {
		const handlers = {
			pointerdown: event => this.beginPointer(event),
			pointermove: event => this.movePointer(event),
			pointerup: event => this.endPointer(event),
			pointercancel: event => this.endPointer(event)
		};
		for (const [type, handler] of Object.entries(handlers)) {
			this.surface.addEventListener(type, handler, { passive: false });
			this.disposers.push(() => this.surface.removeEventListener(type, handler));
		}
	}

	beginPointer(event) {
		if (!this.game.isPlaying || this.game.isPaused || this.game.runState.completed) return;
		if (!this.state.beginPointer(event.pointerId, event.clientX, event.clientY)) return;
		event.preventDefault();
		try { this.surface.setPointerCapture?.(event.pointerId); } catch {}
		this.game.beginAim(this.state.x, this.state.y);
	}

	movePointer(event) {
		if (!this.state.movePointer(event.pointerId, event.clientX, event.clientY)) return;
		event.preventDefault();
		this.game.moveAim(this.state.x, this.state.y);
	}

	endPointer(event) {
		if (!this.state.endPointer(event.pointerId)) return;
		event.preventDefault();
		this.game.endAim();
	}

	syncControlStatus() {
		updateKabbalahControlStatus(this.game, this.controls);
	}

	setTimeHeld(held) {
		this.state.setTimeHeld(held);
		this.game.setTimeActive(this.state.timeHeld);
	}

	/** Release aim and held Time immediately when lifecycle state makes input ineligible. */
	releaseHeldActions() {
		this.state.setTimeHeld(false);
		this.timeButton?.setAttribute('aria-pressed', 'false');
		this.game.setTimeActive(false);
		this.game.endAim();
	}

	/** Release semantic actions and every listener owned by this input generation. */
	dispose() {
		this.releaseHeldActions();
		this.disposers.splice(0).forEach(dispose => dispose());
	}
}
