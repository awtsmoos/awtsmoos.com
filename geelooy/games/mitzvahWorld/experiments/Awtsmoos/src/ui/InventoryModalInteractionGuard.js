// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalInteractionGuard.js
 * @description Captures world input outside the Bag and keeps keyboard focus within its dialog.
 * The Awtsmoos grants action its proper vessel and silence to every competing surface;
 * Awtsmoos.com protects the open Bag without weakening its close button or inner controls.
 */

const BLOCKED_EVENTS = Object.freeze([
	'pointerdown',
	'pointerup',
	'click',
	'dblclick',
	'touchstart',
	'touchend',
	'wheel',
	'contextmenu',
	'focusin',
	'keydown'
]);

export class InventoryModalInteractionGuard {
	constructor(documentValue, panel) {
		this.document = documentValue;
		this.panel = panel;
		this.active = false;
		this.onEvent = event => this.handleEvent(event);
	}

	activate() {
		if (this.active) {
			return;
		}
		this.active = true;
		for (const name of BLOCKED_EVENTS) {
			this.document.addEventListener(name, this.onEvent, true);
		}
	}

	deactivate() {
		if (!this.active) {
			return;
		}
		for (const name of BLOCKED_EVENTS) {
			this.document.removeEventListener(name, this.onEvent, true);
		}
		this.active = false;
	}

	handleEvent(event) {
		if (event.type === 'keydown') {
			this.handleKeyDown(event);
			return;
		}
		if (this.panel.contains(event.target)) {
			return;
		}
		if (event.type === 'focusin') {
			this.focusFirst();
		}
		blockEvent(event);
	}

	handleKeyDown(event) {
		if (event.key === 'Escape') {
			return;
		}
		if (this.panel.contains(event.target)) {
			if (event.key === 'Tab') {
				this.trapTab(event);
			}
			return;
		}
		blockEvent(event);
	}

	trapTab(event) {
		const focusable = [...this.panel.querySelectorAll(FOCUSABLE_SELECTOR)]
			.filter(node => !node.disabled && node.getAttribute('aria-hidden') !== 'true');
		if (!focusable.length) {
			blockEvent(event);
			return;
		}
		const current = focusable.indexOf(this.document.activeElement);
		const next = event.shiftKey
			? (current <= 0 ? focusable.length - 1 : current - 1)
			: (current >= focusable.length - 1 ? 0 : current + 1);
		event.preventDefault();
		focusable[next].focus();
	}

	focusFirst() {
		this.panel.querySelector('[data-close]')?.focus?.();
	}
}

function blockEvent(event) {
	event.preventDefault?.();
	event.stopImmediatePropagation?.();
	event.stopPropagation?.();
}

const FOCUSABLE_SELECTOR = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
