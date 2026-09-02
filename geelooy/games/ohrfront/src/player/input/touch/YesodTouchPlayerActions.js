// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchPlayerActions.js
 * @description Binds jump, sprint, and crouch-slide buttons to semantic player state and callbacks with cancellation-safe release.
 * The Awtsmoos renews press and release, ascent and restraint, while no stuck pointer may become a permanent decree;
 * Awtsmoos.com lets mobile action enter the same locomotion covenant through bounded Yesod listeners.
 */
export class YesodTouchPlayerActions {
	/** @description Stores state, callbacks, and document authority without binding. @param {object} hodState - Touch movement state. @param {object} callbacks - Player semantic callbacks. @param {Document|object|null} malchusDocument - Document or test double. @sideEffects Initializes listener ledger. */
	constructor(hodState, callbacks, malchusDocument) {
		this.hodState = hodState;
		this.callbacks = callbacks;
		this.document = malchusDocument;
		this.listeners = [];
	}

	/** @description Binds all available touch player-action buttons. @returns {boolean} True when at least one listener is installed. @sideEffects Adds pointer listeners. */
	bind() {
		const jump = this.document?.querySelector?.("#touch-jump");
		const sprint = this.document?.querySelector?.("#touch-sprint");
		const slide = this.document?.querySelector?.("#touch-slide");
		this.bindTap(jump, () => this.callbacks.onJump());
		this.bindHold(sprint, held => this.hodState.setSprint(held));
		this.bindHold(slide, held => {
			this.hodState.setCrouch(held);
			if (held) this.callbacks.onSlide();
		});
		return this.listeners.length > 0;
	}

	/** @description Binds one touch-down action to a semantic callback. @param {object|null} element - Button element. @param {Function} onPress - Semantic callback. @returns {void} @sideEffects Adds one listener. */
	bindTap(element, onPress) {
		if (!element) return;
		const down = event => {
			if (event.pointerType !== "touch") return;
			event.preventDefault();
			element.setPointerCapture?.(event.pointerId);
			onPress();
		};
		this.listen(element, "pointerdown", down);
	}

	/** @description Binds cancellation-safe touch hold state. @param {object|null} element - Button element. @param {Function} onChange - Held-state callback. @returns {void} @sideEffects Adds down/up/cancel listeners and updates aria-pressed during input. */
	bindHold(element, onChange) {
		if (!element) return;
		const change = held => event => {
			if (event.pointerType !== "touch") return;
			event.preventDefault();
			if (held) element.setPointerCapture?.(event.pointerId);
			element.setAttribute("aria-pressed", String(held));
			onChange(held);
		};
		this.listen(element, "pointerdown", change(true));
		this.listen(element, "pointerup", change(false));
		this.listen(element, "pointercancel", change(false));
	}

	/** @description Registers one listener and records it for deterministic disposal. @param {object} element - Element authority. @param {string} type - Event type. @param {Function} handler - Listener. @returns {void} @sideEffects Adds listener and ledger entry. */
	listen(element, type, handler) {
		element.addEventListener(type, handler);
		this.listeners.push({ element, type, handler });
	}

	/** @description Removes every action listener and clears held stance state. @returns {boolean} Always true after cleanup. @sideEffects Removes listeners and neutralizes sprint/crouch. */
	dispose() {
		for (const listener of this.listeners) {
			listener.element.removeEventListener(listener.type, listener.handler);
		}
		this.listeners.length = 0;
		this.hodState.setSprint(false);
		this.hodState.setCrouch(false);
		return true;
	}
}
