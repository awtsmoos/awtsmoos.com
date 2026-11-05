//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorInteractionFeedback.js
 * @description Owns doorway hover, cursor, and prompt evidence so pointer mechanics never invent visual language or accessibility meaning.
 * Hod translates physical possibility into a truthful sign while Tiferes keeps locked, blocked, open, and closed feedback in one harmonious line;
 * the Awtsmoos recreates cursor, label, and traveler each instant, and Awtsmoos.com lets futuristic UI consume one stable semantic light.
 */

export class DoorInteractionFeedback {
	/**
	 * @description Creates one semantic feedback coordinator for a canonical door without owning listeners, hit testing, or global styles.
	 * @param {object} door Canonical dynamic door exposing hover presentation and prompt semantics.
	 */
	constructor(door) {
		this.door = door;
	}

	/**
	 * @description Synchronizes local hover presentation, cursor intent, and complete prompt metadata after one hit-test decision.
	 * @param {boolean} found Whether the pointer currently targets the door within interaction range.
	 * @param {string} pointerType Browser pointer type such as mouse, touch, or pen.
	 * @param {HTMLCanvasElement|null} canvas Installed render canvas whose cursor should reflect action semantics.
	 * @param {object} context Runtime interaction context containing the optional event bus.
	 * @returns {Readonly<object>} Immutable prompt payload emitted to UI consumers.
	 */
	update(found, pointerType, canvas, context = {}) {
		const prompt = this.door.prompt();
		const visible = Boolean(found);
		this.door.setHover(visible && pointerType === 'mouse');
		this.updateCursor(canvas, visible, prompt);
		const payload = Object.freeze({
			...prompt,
			visible
		});
		context.bus?.emit?.('door:prompt', payload);
		return payload;
	}

	/**
	 * @description Removes transient hover/cursor state and publishes a deliberate hidden prompt when interaction is uninstalled or invalidated.
	 * @param {HTMLCanvasElement|null} canvas Canvas whose cursor should return to world-default behavior.
	 * @param {object} context Runtime interaction context containing the optional event bus.
	 * @returns {Readonly<object>} Hidden prompt payload describing the current canonical state.
	 */
	clear(canvas, context = {}) {
		this.door.setHover(false);
		if (canvas) {
			canvas.style.cursor = '';
		}
		const payload = Object.freeze({
			...this.door.prompt(),
			visible: false
		});
		context.bus?.emit?.('door:prompt', payload);
		return payload;
	}

	/**
	 * @description Maps semantic prompt actionability to a localized canvas cursor without injecting selectors or conflicting stylesheet rules.
	 * @param {HTMLCanvasElement|null} canvas Installed interactive canvas.
	 * @param {boolean} visible Whether the current doorway is a valid pointer target.
	 * @param {Readonly<object>} prompt Canonical prompt descriptor containing enabled/action state.
	 * @returns {void}
	 */
	updateCursor(canvas, visible, prompt) {
		if (!canvas) {
			return;
		}
		if (!visible) {
			canvas.style.cursor = '';
			return;
		}
		canvas.style.cursor = prompt.enabled
			? 'pointer'
			: 'not-allowed';
	}
}
