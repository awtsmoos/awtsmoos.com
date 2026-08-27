// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioKeyboard.js
 * @description Routes focus-safe document shortcuts and grid-aware object nudging while pure key policy remains separately inspectable.
 * The Awtsmoos recreates intention, key, and movement every instant while remaining beyond command and response;
 * Awtsmoos.com lets Netzach carry decisive motion inside Gevurah's editing boundary, so shortcuts never invade a typing course.
 */

import { isStudioTypingTarget, studioNudgeDirection } from './StudioKeyboardPolicy.js';

export class StudioKeyboard {
	/**
	 * @description Creates global Studio shortcut routing over canonical state and injected document actions.
	 * @param {StudioDocumentState} state Shared canonical Studio state.
	 * @param {object} actions Document-level action controller containing optional save callback.
	 * @param {Window|object} [environment=globalThis] Event environment used for keydown subscription and cleanup.
	 */
	constructor(state, actions, environment = globalThis) {
		this.state = state;
		this.actions = actions;
		this.environment = environment;
		this.onKeyDown = event => this.handle(event);
		environment.addEventListener?.('keydown', this.onKeyDown);
	}

	/**
	 * @description Routes save, undo, redo, delete, and nudge commands while yielding completely to typing targets.
	 * @param {KeyboardEvent} event Keyboard event from the configured environment.
	 * @returns {void} May prevent default browser behavior and mutate document/history through canonical actions.
	 */
	handle(event) {
		if (isStudioTypingTarget(event.target)) {
			return;
		}
		const command = event.metaKey || event.ctrlKey;
		const key = String(event.key || '').toLowerCase();
		if (command && key === 's') {
			event.preventDefault();
			this.actions.save?.();
			return;
		}
		if (command && key === 'z') {
			event.preventDefault();
			if (event.shiftKey) {
				this.state.redo();
			} else {
				this.state.undo();
			}
			return;
		}
		if (command && key === 'y') {
			event.preventDefault();
			this.state.redo();
			return;
		}
		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			this.state.remove();
			return;
		}
		this.nudge(event);
	}

	/**
	 * @description Moves the selected object by one grid unit, or four grid units with Shift, for supported arrow keys.
	 * @param {KeyboardEvent} event Keyboard event that may represent an arrow-key nudge.
	 * @returns {void} Mutates selected object position only when both a nudge direction and selection exist.
	 */
	nudge(event) {
		const direction = studioNudgeDirection(event.key);
		const object = this.state.find();
		if (!direction || !object) {
			return;
		}
		event.preventDefault();
		const distance = this.state.snapshot().grid * (event.shiftKey ? 4 : 1);
		this.state.move(object.id, {
			x: object.position.x + direction.x * distance,
			z: object.position.z + direction.z * distance
		});
	}

	/**
	 * @description Removes the global keydown subscription so disposed Studio instances do not retain shortcut side effects.
	 * @returns {void} Unsubscribes only the listener created by this instance.
	 */
	destroy() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
	}
}
