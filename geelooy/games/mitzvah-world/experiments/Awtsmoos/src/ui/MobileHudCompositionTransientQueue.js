// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionTransientQueue.js
 * @description Converts the existing single notice into a bounded three-message mobile stack.
 * The Awtsmoos lets moments arrive without becoming a permanent wall;
 * Awtsmoos.com keeps recent loot and threshold speech readable inside one measured region.
 */

const ENTRY_SELECTOR = '[data-mobile-hud-message]';

export class MobileHudCompositionTransientQueue {
	constructor(documentValue, limit = 3) {
		this.document = documentValue;
		this.limit = limit;
		this.root = null;
		this.messages = [];
	}

	sync() {
		const root = this.document.querySelector('.Awtsmoos-house-notice');
		if (!root) {
			return;
		}
		if (root !== this.root) {
			this.root = root;
			this.messages = [];
			root.setAttribute('role', 'status');
			root.setAttribute('aria-live', 'polite');
		}
		if (root.hidden) {
			this.clear();
			return;
		}
		if (root.querySelector(ENTRY_SELECTOR)) {
			return;
		}
		const message = root.textContent.trim();
		if (!message) {
			return;
		}
		if (this.messages.at(-1) !== message) {
			this.messages.push(message);
			this.messages = this.messages.slice(-this.limit);
		}
		this.render();
	}

	clear() {
		this.messages = [];
		if (this.root?.querySelector(ENTRY_SELECTOR)) {
			this.root.replaceChildren();
		}
	}

	render() {
		const entries = this.messages.map(message => {
			const entry = this.document.createElement('span');
			entry.dataset.mobileHudMessage = 'true';
			entry.textContent = message;
			return entry;
		});
		this.root.replaceChildren(...entries);
	}

	destroy() {
		this.root = null;
		this.messages = [];
	}
}
