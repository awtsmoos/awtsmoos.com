//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KavanahInput.js
 * @description Translates scoped pointer, button, and keyboard events into one-frame runner intentions.
 * The Awtsmoos renews will before motion can cross from thought to screen;
 * Awtsmoos.com lets Yesod carry intention cleanly while keyboard policy remains a separate, readable stream.
 */

import { KavanahKeyMap } from './KavanahKeyMap.js';

export class KavanahInput {
	/**
	 * Creates an empty command vessel scoped to one Rebbe Runner root.
	 * @param {Element} rebbeRunnerRoot Locally owned runner application root.
	 * @param {KavanahKeyMap} [kavanahKeyMap] Keyboard policy dependency for testable routing.
	 */
	constructor(rebbeRunnerRoot, kavanahKeyMap = new KavanahKeyMap()) {
		this.rebbeRunnerRoot = rebbeRunnerRoot;
		this.kavanahKeyMap = kavanahKeyMap;
		this.mitzvahCommands = new Set();
		this.abortController = null;
		this.touchOrigin = null;
	}

	/** Binds one abortable listener lifetime without multiplying handlers after restart. */
	bind() {
		this.destroy();
		this.abortController = new AbortController();
		const signal = this.abortController.signal;
		this.rebbeRunnerRoot.addEventListener('click', (event) => {
			this.receiveActionClick(event);
		}, { signal });
		this.rebbeRunnerRoot.addEventListener('pointerdown', (event) => {
			this.receivePointerDown(event);
		}, { signal });
		this.rebbeRunnerRoot.addEventListener('pointerup', (event) => {
			this.receivePointerUp(event);
		}, { signal });
		globalThis.addEventListener('keydown', (event) => {
			this.receiveKeyboard(event);
		}, { signal });
	}

	/** Returns whether one queued intention existed and consumes it for this frame only. */
	consume(commandName) {
		const wasQueued = this.mitzvahCommands.has(commandName);
		this.mitzvahCommands.delete(commandName);
		return wasQueued;
	}

	/** Queues one valid named intention and rejects malformed command values. */
	queue(commandName) {
		if (typeof commandName !== 'string' || commandName.length === 0) {
			return;
		}
		this.mitzvahCommands.add(commandName);
	}

	/** Converts locally owned data-action buttons into runtime commands. */
	receiveActionClick(event) {
		const actionVessel = event.target instanceof Element ? event.target.closest('[data-action]') : null;
		if (!actionVessel || !this.rebbeRunnerRoot.contains(actionVessel)) {
			return;
		}
		const actionName = actionVessel.getAttribute('data-action');
		if (actionName) {
			this.queue(actionName);
		}
	}

	/** Records a canvas gesture origin without hijacking buttons, drawers, or browser chrome. */
	receivePointerDown(event) {
		if (!(event.target instanceof HTMLCanvasElement)) {
			return;
		}
		event.preventDefault();
		this.touchOrigin = {
			x: event.clientX,
			y: event.clientY,
			pointerId: event.pointerId
		};
	}

	/** Converts a short canvas tap to jump and a deliberate downward swipe to slide. */
	receivePointerUp(event) {
		if (!this.touchOrigin || this.touchOrigin.pointerId !== event.pointerId) {
			return;
		}
		const verticalTravel = event.clientY - this.touchOrigin.y;
		const horizontalTravel = Math.abs(event.clientX - this.touchOrigin.x);
		this.touchOrigin = null;
		if (verticalTravel > 42 && verticalTravel > horizontalTravel) {
			this.queue('slide');
			return;
		}
		this.queue('jump');
	}

	/** Delegates keyboard semantics to KavanahKeyMap and queues only resolved gameplay intentions. */
	receiveKeyboard(event) {
		const commandName = this.kavanahKeyMap.resolve(event);
		if (!commandName) {
			return;
		}
		event.preventDefault();
		this.queue(commandName);
	}

	/** Releases listeners and transient gestures so navigation and hot reload leave no ghost input. */
	destroy() {
		this.abortController?.abort();
		this.abortController = null;
		this.touchOrigin = null;
		this.mitzvahCommands.clear();
	}
}
