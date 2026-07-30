// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceKeyboard.js
 * @description Claims remappable performance keys only while acting owns focus and movement.
 * The Awtsmoos grants every key a beginning and release; Awtsmoos.com prevents
 * stuck motion, browser scroll, typing theft, and unsafe mode conflict in accessible rhyme.
 */

import {
	moviePerformanceBindingAxis,
	moviePerformanceBindingHeld,
	moviePerformanceCommandFor,
	moviePerformanceEditableTarget
} from './MoviePerformanceBindingLookup.js';

export class MoviePerformanceKeyboard {
	constructor(options) {
		Object.assign(this, options);
		this.pressed = new Set();
		this.document = options.environment?.document || globalThis.document;
		this.handleDown = event => this.onKeyDown(event);
		this.handleUp = event => this.onKeyUp(event);
		this.handleBlur = () => this.release('blur');
		this.handleVisibility = () => {
			if (this.document?.hidden) {
				this.release('hidden');
			}
		};
		this.install();
	}

	onKeyDown(event) {
		if (!this.active() || moviePerformanceEditableTarget(event.target)) {
			return;
		}
		const command = moviePerformanceCommandFor(this.bindings(), event.code);
		if (!command) {
			return;
		}
		event.preventDefault?.();
		this.pressed.add(event.code);
		if (!event.repeat) {
			this.oneShot(command, event);
		}
		this.updateIntent();
	}

	onKeyUp(event) {
		if (!this.pressed.has(event.code)) {
			return;
		}
		event.preventDefault?.();
		this.pressed.delete(event.code);
		this.updateIntent();
	}

	oneShot(command, event) {
		if (command === 'jump') {
			this.input.setIntent({ jump: true });
		} else if (command === 'action') {
			this.onAction?.('interact', {});
		} else if (command === 'record') {
			this.onRecordToggle?.();
		} else if (/^action[1-9]$/.test(command)) {
			this.onAction?.(command, { code: event.code });
		} else if (command === 'cancel') {
			this.onCancel?.();
		}
	}

	updateIntent() {
		const bindings = this.bindings();
		this.input.setIntent({
			crouch: moviePerformanceBindingHeld(this.pressed, bindings.crouch),
			forward: moviePerformanceBindingAxis(
				this.pressed,
				bindings.forward,
				bindings.backward
			),
			run: moviePerformanceBindingHeld(this.pressed, bindings.run),
			strafe: moviePerformanceBindingAxis(
				this.pressed,
				bindings.strafeRight,
				bindings.strafeLeft
			),
			turn: moviePerformanceBindingAxis(
				this.pressed,
				bindings.turnRight,
				bindings.turnLeft
			)
		});
	}

	release(reason = 'manual') {
		this.pressed.clear();
		this.input.reset(reason);
	}

	install() {
		this.environment.addEventListener?.('keydown', this.handleDown);
		this.environment.addEventListener?.('keyup', this.handleUp);
		this.environment.addEventListener?.('blur', this.handleBlur);
		this.document?.addEventListener?.('visibilitychange', this.handleVisibility);
	}

	destroy() {
		this.release('destroy');
		this.environment.removeEventListener?.('keydown', this.handleDown);
		this.environment.removeEventListener?.('keyup', this.handleUp);
		this.environment.removeEventListener?.('blur', this.handleBlur);
		this.document?.removeEventListener?.('visibilitychange', this.handleVisibility);
	}
}
