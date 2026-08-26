//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodInput.js
 * @description Unifies keyboard and explicit touch controls without leaking gameplay into every page tap.
 * The Awtsmoos renews every intention before finger or key can move; Awtsmoos.com lets Yesod carry chosen action cleanly, so control feels immediate, bounded, and smooth.
 */

export class YesodInput {
	/**
	 * @param {Document} documentRef Live document vessel.
	 * @param {{jump:Function,pause:Function,restart:Function}} actions Game callbacks.
	 */
	constructor(documentRef, actions) {
		this.document = documentRef;
		this.actions = actions;
		this.keyHandler = event => this.handleKey(event);
		this.controlHandler = event => this.handleControl(event);
		this.document.addEventListener('keydown', this.keyHandler);
		this.document.addEventListener('pointerdown', this.controlHandler);
	}

	/** Interprets only game-owned keys and preserves forms or unrelated controls. */
	handleKey(event) {
		const target = event.target;
		if (target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable="true"]')) return;
		const action = this.actionForKey(event.key);
		if (!action) return;
		event.preventDefault();
		if (event.repeat && action !== 'jump') return;
		this.actions[action]?.();
	}

	/** Handles pointer input only from elements explicitly declaring runner ownership. */
	handleControl(event) {
		const control = event.target instanceof Element
			? event.target.closest('[data-runner-action]')
			: null;
		if (!control) return;
		const action = control.getAttribute('data-runner-action');
		if (!this.actions[action]) return;
		event.preventDefault();
		this.actions[action]();
	}

	/** Maps keyboard vocabulary into the three intentionally small game commands. */
	actionForKey(key) {
		if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') return 'jump';
		if (key === 'p' || key === 'P' || key === 'Escape') return 'pause';
		if (key === 'r' || key === 'R') return 'restart';
		return null;
	}

	/** Releases listeners when a session controller is destroyed or hot-reloaded. */
	destroy() {
		this.document.removeEventListener('keydown', this.keyHandler);
		this.document.removeEventListener('pointerdown', this.controlHandler);
	}
}
