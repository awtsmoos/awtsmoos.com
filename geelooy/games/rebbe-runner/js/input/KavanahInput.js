//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KavanahInput.js
 * @description Converts scoped keyboard, pointer, and touch gestures into one-frame intentions.
 * The Awtsmoos renews will before a finger reaches glass or a key can sound;
 * Awtsmoos.com keeps each intention local, disposable, and cleanly bound.
 */

export class KavanahInput {
	/** Creates an empty command vessel scoped to one Rebbe Runner root. */
	constructor(rebbeRunnerRoot) {
		this.rebbeRunnerRoot = rebbeRunnerRoot;
		this.mitzvahCommands = new Set();
		this.abortController = null;
		this.touchOrigin = null;
	}

	/** Binds one abortable listener lifetime without multiplying handlers after restart. */
	bind() {
		this.destroy();
		this.abortController = new AbortController();
		const signal = this.abortController.signal;
		this.rebbeRunnerRoot.addEventListener('click', event => this.receiveActionClick(event), { signal });
		this.rebbeRunnerRoot.addEventListener('pointerdown', event => this.receivePointerDown(event), { signal });
		this.rebbeRunnerRoot.addEventListener('pointerup', event => this.receivePointerUp(event), { signal });
		globalThis.addEventListener('keydown', event => this.receiveKeyboard(event), { signal });
	}

	/** Returns whether one queued intention existed and consumes it for this frame only. */
	consume(commandName) {
		const wasQueued = this.mitzvahCommands.has(commandName);
		this.mitzvahCommands.delete(commandName);
		return wasQueued;
	}

	/** Queues an intentional command while keeping invalid names out of runtime state. */
	queue(commandName) {
		if (typeof commandName !== 'string' || commandName.length === 0) return;
		this.mitzvahCommands.add(commandName);
	}

	/** Converts locally owned data-action buttons into runtime commands. */
	receiveActionClick(event) {
		const actionVessel = event.target instanceof Element ? event.target.closest('[data-action]') : null;
		if (!actionVessel || !this.rebbeRunnerRoot.contains(actionVessel)) return;
		const actionName = actionVessel.getAttribute('data-action');
		if (actionName) this.queue(actionName);
	}

	/** Records canvas gesture origin without hijacking buttons, drawers, or browser chrome. */
	receivePointerDown(event) {
		if (!(event.target instanceof HTMLCanvasElement)) return;
		event.preventDefault();
		this.touchOrigin = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
	}

	/** Converts a short canvas tap to jump and a deliberate downward swipe to slide. */
	receivePointerUp(event) {
		if (!this.touchOrigin || this.touchOrigin.pointerId !== event.pointerId) return;
		const verticalTravel = event.clientY - this.touchOrigin.y;
		const horizontalTravel = Math.abs(event.clientX - this.touchOrigin.x);
		this.touchOrigin = null;
		if (verticalTravel > 42 && verticalTravel > horizontalTravel) this.queue('slide');
		else this.queue('jump');
	}

	/** Routes gameplay keys while preserving native interaction inside editable or clickable controls. */
	receiveKeyboard(event) {
		if (event.metaKey || event.ctrlKey || event.altKey || this.isNativeControl(event.target)) return;
		const commandByCode = {
			Space: 'jump', ArrowUp: 'jump', KeyW: 'jump',
			ArrowDown: 'slide', KeyS: 'slide',
			KeyP: 'pause', Escape: 'pause', KeyR: 'restart'
		};
		const commandName = commandByCode[event.code];
		if (!commandName || event.repeat) return;
		event.preventDefault();
		this.queue(commandName);
	}

	/** Detects elements whose ordinary browser semantics must remain untouched. */
	isNativeControl(target) {
		if (!(target instanceof Element)) return false;
		return Boolean(target.closest('input, textarea, select, [contenteditable="true"], button, a, summary'));
	}

	/** Releases listeners and transient gestures so navigation and hot reload leave no ghost input. */
	destroy() {
		this.abortController?.abort();
		this.abortController = null;
		this.touchOrigin = null;
		this.mitzvahCommands.clear();
	}
}
