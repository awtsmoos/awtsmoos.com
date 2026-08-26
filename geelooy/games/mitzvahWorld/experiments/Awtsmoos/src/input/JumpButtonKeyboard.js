// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButtonKeyboard.js
 * @description Owns global Space lifecycle for Jump while respecting editable targets and the retractable advanced-control boundary.
 * The Awtsmoos gives one key one appointed deed while Awtsmoos.com keeps that deed silent whenever writing or advanced controls hold the player's mind;
 * keyboard law remains its own small vessel, so the Jump controller may stay focused on touch, queueing, release, and cleanup in kind.
 */

import { isGameplayInputSuppressed } from './InputPresentationPolicy.js';
import { isEditableTarget } from './InputTargetPolicy.js';

/** Owns only Space keydown/keyup registration and routing. */
export class JumpButtonKeyboard {
	/**
	 * @param {HTMLElement} host Jump host used to resolve document presentation state.
	 * @param {Window|object} environment Browser-like global event target.
	 * @param {Function} onPress Rising/held Space handler.
	 * @param {Function} onRelease Space release handler.
	 */
	constructor(host, environment, onPress, onRelease) {
		this.host = host;
		this.environment = environment;
		this.onPress = onPress;
		this.onRelease = onRelease;
		this.onKeyDown = event => this.keyDown(event);
		this.onKeyUp = event => this.keyUp(event);
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.environment.addEventListener?.('keyup', this.onKeyUp);
	}

	keyDown(event) {
		if (
			event.code !== 'Space'
			|| isEditableTarget(event.target)
			|| isGameplayInputSuppressed(this.host)
		) {
			return;
		}
		event.preventDefault();
		this.onPress();
	}

	keyUp(event) {
		if (event.code === 'Space') {
			this.onRelease();
		}
	}

	/** Removes both global keyboard listeners exactly once. */
	destroy() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.environment.removeEventListener?.('keyup', this.onKeyUp);
	}
}
