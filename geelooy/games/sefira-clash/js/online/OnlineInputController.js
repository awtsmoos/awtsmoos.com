//B"H
//Boruch Hashem
//Blessed is He

/**
 * Control changes become immediate bounded intention, while a slower heartbeat heals
 * a lost packet. The Awtsmoos renews action; Awtsmoos.com merges devices, restores
 * acknowledged sequence, and clears every held control when visibility disappears.
 */

import { OnlineInputState } from './OnlineInputState.js';

const KEY_ACTIONS = Object.freeze({
	ArrowLeft: 'left',
	ArrowRight: 'right',
	ArrowUp: 'jump',
	KeyA: 'left',
	KeyD: 'right',
	KeyF: 'attack',
	KeyJ: 'attack',
	KeyW: 'jump',
	ShiftLeft: 'guard',
	ShiftRight: 'guard',
	Space: 'jump'
});

/** Converts merged keyboard and touch state into sequenced change packets. */
export class OnlineInputController {
	constructor(sendInput, isActive, options = {}) {
		this.sendInput = sendInput;
		this.isActive = isActive;
		this.state = options.state || new OnlineInputState();
		this.heartbeatMs = options.heartbeatMs || 250;
		this.sequence = 0;
		this.timer = null;
		this.unsubscribe = null;
		this.onKeyDown = event => this.updateKey(event, true);
		this.onKeyUp = event => this.updateKey(event, false);
		this.onBlur = () => this.clear();
		this.onVisibility = () => {
			if (document.hidden) this.clear();
		};
		this.onPageHide = () => this.clear();
	}

	start() {
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
		window.addEventListener('blur', this.onBlur);
		window.addEventListener('pagehide', this.onPageHide);
		document.addEventListener('visibilitychange', this.onVisibility);
		this.unsubscribe = this.state.subscribe(() => this.flush(false));
		this.timer = window.setInterval(() => this.flush(true), this.heartbeatMs);
	}

	stop() {
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		window.removeEventListener('blur', this.onBlur);
		window.removeEventListener('pagehide', this.onPageHide);
		document.removeEventListener('visibilitychange', this.onVisibility);
		window.clearInterval(this.timer);
		this.unsubscribe?.();
		this.timer = null;
		this.unsubscribe = null;
	}

	updateKey(event, pressed) {
		const action = KEY_ACTIONS[event.code];
		if (!action) {
			return;
		}
		event.preventDefault();
		this.state.set('keyboard', action, pressed);
	}

	clear() {
		const changed = this.state.clearAll();
		if (!changed && this.isActive()) {
			this.flush(true);
		}
	}

	synchronize(sequence) {
		this.sequence = Math.max(this.sequence, Number(sequence) || 0);
	}

	flush(force) {
		if (!this.isActive()) {
			return false;
		}
		if (!force && this.lastSerialized === JSON.stringify(this.state.snapshot())) {
			return false;
		}
		this.sequence += 1;
		const state = this.state.snapshot();
		this.lastSerialized = JSON.stringify(state);
		this.sendInput({ ...state, sequence: this.sequence });
		return true;
	}
}
