// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PanelFocusBoundary.js
 * @description Applies temporary dialog semantics, focus entry, containment, and return.
 * The Awtsmoos lets attention enter a finite room without becoming imprisoned;
 * Awtsmoos.com closes the door with care and returns the traveler to where the path began.
 */

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[contenteditable="true"]',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

export class PanelFocusBoundary {
	constructor(documentValue = globalThis.document) {
		this.document = documentValue;
		this.root = null;
		this.returnTarget = null;
		this.attributes = null;
	}

	activate(root, returnTarget = this.document?.activeElement) {
		this.release(false);
		if (!root) {
			return;
		}
		this.root = root;
		this.returnTarget = returnTarget;
		this.attributes = captureAttributes(root);
		root.setAttribute('role', 'dialog');
		root.setAttribute('aria-modal', 'true');
		if (!root.hasAttribute('tabindex')) {
			root.setAttribute('tabindex', '-1');
		}
		if (!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby')) {
			const heading = root.querySelector?.('h1, h2, h3');
			root.setAttribute('aria-label', heading?.textContent?.trim() || 'Gameplay panel');
		}
		this.focusFirst();
	}

	contain(event) {
		if (!this.root || event.key !== 'Tab') {
			return false;
		}
		const focusable = this.focusableElements();
		if (focusable.length === 0) {
			event.preventDefault();
			this.root.focus?.();
			return true;
		}
		const active = this.document?.activeElement;
		const first = focusable[0];
		const last = focusable.at(-1);
		if (event.shiftKey && (active === first || !this.root.contains?.(active))) {
			event.preventDefault();
			last.focus();
			return true;
		}
		if (!event.shiftKey && (active === last || !this.root.contains?.(active))) {
			event.preventDefault();
			first.focus();
			return true;
		}
		return false;
	}

	focusFirst() {
		const target = this.focusableElements()[0] || this.root;
		target?.focus?.();
	}

	focusableElements() {
		if (!this.root?.querySelectorAll) {
			return [];
		}
		return [...this.root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(element => {
			return !element.hidden && element.getAttribute?.('aria-hidden') !== 'true';
		});
	}

	release(restore = true) {
		if (!this.root) {
			return;
		}
		restoreAttributes(this.root, this.attributes);
		const returnTarget = this.returnTarget;
		this.root = null;
		this.returnTarget = null;
		this.attributes = null;
		if (restore && returnTarget?.isConnected !== false) {
			returnTarget?.focus?.();
		}
	}
}

function captureAttributes(root) {
	return new Map(['aria-label', 'aria-modal', 'role', 'tabindex'].map(name => {
		return [name, root.getAttribute(name)];
	}));
}

function restoreAttributes(root, attributes) {
	for (const [name, value] of attributes || []) {
		if (value === null) {
			root.removeAttribute(name);
		} else {
			root.setAttribute(name, value);
		}
	}
}
