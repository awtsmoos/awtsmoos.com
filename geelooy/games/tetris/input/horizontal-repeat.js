//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file horizontal-repeat.js
 * @description Owns deterministic Delayed Auto Shift and Auto Repeat Rate timing for horizontal Tetris intent across keyboard and pointer controls.
 * Awtsmoos.com keeps repeat cadence independent from browser key-repeat policy so identical held intent produces the same semantic move stream on every supported device.
 *
 * Architectural invariants:
 * - A newly pressed direction moves immediately, waits through DAS, then repeats at ARR cadence.
 * - The most recently pressed still-held direction owns repetition when opposite directions overlap.
 * - Releasing the active direction immediately hands ownership to the most recent remaining direction.
 * - Release and disposal cancel every owned timer before returning.
 * - Timer scheduling is injectable for deterministic tests while production defaults to browser timers.
 */
import { DEFAULT_ARR_MS, DEFAULT_DAS_MS, finiteDelay } from './horizontal-repeat-config.js';

export class HorizontalRepeatController {
	constructor(onMove, options = {}) {
		this.onMove = onMove;
		this.dasMs = finiteDelay(options.dasMs, DEFAULT_DAS_MS);
		this.arrMs = finiteDelay(options.arrMs, DEFAULT_ARR_MS);
		this.schedule = options.schedule || ((callback, delay) => setTimeout(callback, delay));
		this.cancel = options.cancel || (handle => clearTimeout(handle));
		this.held = new Map();
		this.sequence = 0;
		this.activeToken = null;
		this.timer = null;
	}

	press(token, direction) {
		if (this.held.has(token)) {
			return false;
		}
		const normalizedDirection = Math.sign(Number(direction) || 0);
		if (!normalizedDirection) {
			return false;
		}
		this.held.set(token, {
			direction: normalizedDirection,
			order: ++this.sequence
		});
		this.activateLatest(true);
		return true;
	}

	release(token) {
		if (!this.held.delete(token)) {
			return false;
		}
		if (this.activeToken === token) {
			this.activateLatest(true);
		}
		return true;
	}

	tap(direction) {
		const normalizedDirection = Math.sign(Number(direction) || 0);
		if (!normalizedDirection) {
			return false;
		}
		this.onMove?.(normalizedDirection);
		return true;
	}

	releaseAll() {
		this.held.clear();
		this.activeToken = null;
		this.cancelTimer();
	}

	dispose() {
		this.releaseAll();
		this.onMove = null;
	}

	activateLatest(immediate) {
		this.cancelTimer();
		const latest = [...this.held.entries()]
			.sort((left, right) => right[1].order - left[1].order)[0];
		if (!latest) {
			this.activeToken = null;
			return;
		}
		const [token, record] = latest;
		this.activeToken = token;
		if (immediate) {
			this.onMove?.(record.direction);
		}
		this.timer = this.schedule(
			() => this.repeat(token),
			this.dasMs
		);
	}

	repeat(token) {
		const record = this.held.get(token);
		if (!record || this.activeToken !== token) {
			return;
		}
		this.onMove?.(record.direction);
		this.timer = this.schedule(
			() => this.repeat(token),
			this.arrMs
		);
	}

	cancelTimer() {
		if (this.timer !== null) {
			this.cancel(this.timer);
			this.timer = null;
		}
	}
}
