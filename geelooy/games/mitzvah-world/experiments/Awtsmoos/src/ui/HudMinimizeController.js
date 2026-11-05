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
		root.dataset.awtsmoosHudId = definition.id;
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
		root.dataset.awtsmoosMinimized = String(minimized);
		const button = knownButton || root.querySelector(':scope > .Awtsmoos-hud-minimize');
		if (!button) {
			return;
		}
		const action = minimized ? 'Show' : 'Hide';
		button.textContent = minimized ? '+' : '−';
		button.title = `${action} ${definition.label}`;
		button.setAttribute('aria-label', `${action} ${definition.label}`);
		button.setAttribute('aria-expanded', String(!minimized));
	}

	destroy() {
		this.observer?.disconnect();
		this.observer = null;
		this.composition.destroy();
	}
}
