// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudMinimizeController.js
 * @description Coordinates persistent folding with late-created explicit mobile HUD zones.
 * The Awtsmoos is unchanged whether a vessel shines or rests; Awtsmoos.com lets finite panels
 * fold without surrendering the measured composition that keeps neighboring surfaces apart.
 */

import { defaultHudMinimized, hudLayoutRegistry } from './HudLayoutRegistry.js';
import { MobileHudCompositionController } from './MobileHudCompositionController.js';
import {
	readHudMinimizeState,
	writeHudMinimizeState
} from './MobileHudCompositionMinimizeStorage.js';
import { isCompactHudViewport } from './MobileHudCompositionRegistry.js';

export class HudMinimizeController {
	constructor(documentValue = document, storage = globalThis.localStorage) {
		this.document = documentValue;
		this.environment = documentValue.defaultView || globalThis;
		this.storage = storage;
		this.layouts = hudLayoutRegistry();
		this.saved = readHudMinimizeState(storage);
		this.composition = new MobileHudCompositionController(documentValue);
		this.observer = null;
		this.syncQueued = false;
	}

	install() {
		this.sync();
		const Observer = this.environment.MutationObserver || globalThis.MutationObserver;
		if (Observer) {
			this.observer = new Observer(() => this.queueSync());
			this.observer.observe(this.document.body, {
				attributeFilter: ['hidden', 'data-open'],
				attributes: true,
				childList: true,
				subtree: true
			});
		}
		return this;
	}

	queueSync() {
		if (this.syncQueued) {
			return;
		}
		this.syncQueued = true;
		const enqueue = this.environment.queueMicrotask || globalThis.queueMicrotask;
		enqueue(() => {
			this.syncQueued = false;
			this.sync();
		});
	}

	sync() {
		const compact = isCompactHudViewport(this.environment);
		for (const definition of this.layouts) {
			const root = this.document.querySelector(definition.selector);
			if (root) {
				this.prepare(root, definition, compact);
			}
		}
		this.composition.sync();
	}

	prepare(root, definition, compact) {
		if (root.dataset.awtsmoosHudId !== definition.id) {
			root.dataset.awtsmoosHudId = definition.id;
		}
		let button = root.querySelector(':scope > .Awtsmoos-hud-minimize');
		if (!button) {
			button = this.createButton(root, definition);
			root.append(button);
		}
		const savedValue = this.saved[definition.id];
		const minimized = typeof savedValue === 'boolean'
			? savedValue
			: defaultHudMinimized(definition, compact);
		this.apply(root, definition, minimized, button);
	}

	createButton(root, definition) {
		const button = this.document.createElement('button');
		button.type = 'button';
		button.className = 'Awtsmoos-hud-minimize';
		button.addEventListener('pointerdown', event => event.stopPropagation());
		button.addEventListener('click', event => {
			event.preventDefault();
			event.stopPropagation();
			const minimized = root.dataset.awtsmoosMinimized !== 'true';
			this.saved[definition.id] = minimized;
			writeHudMinimizeState(this.storage, this.saved);
			this.apply(root, definition, minimized, button);
		});
		return button;
	}

	apply(root, definition, minimized, knownButton = null) {
		// Every write here must be change-guarded: this controller observes the
		// whole body subtree, and an unconditional write (above all textContent,
		// a childList mutation) re-fires the observer, queues another sync, and
		// spins the main thread in an endless microtask loop — the freeze that
		// killed the Procedural Platform route on click.
		const minimizedValue = String(minimized);
		if (root.dataset.awtsmoosMinimized !== minimizedValue) {
			root.dataset.awtsmoosMinimized = minimizedValue;
		}
		const button = knownButton || root.querySelector(':scope > .Awtsmoos-hud-minimize');
		if (!button) {
			return;
		}
		const glyph = minimized ? '+' : '−';
		if (button.textContent !== glyph) {
			button.textContent = glyph;
		}
		const actionLabel = `${minimized ? 'Show' : 'Hide'} ${definition.label}`;
		if (button.title !== actionLabel) {
			button.title = actionLabel;
		}
		if (button.getAttribute('aria-label') !== actionLabel) {
			button.setAttribute('aria-label', actionLabel);
		}
		const expandedValue = String(!minimized);
		if (button.getAttribute('aria-expanded') !== expandedValue) {
			button.setAttribute('aria-expanded', expandedValue);
		}
	}

	destroy() {
		this.observer?.disconnect();
		this.observer = null;
		this.composition.destroy();
	}
}
