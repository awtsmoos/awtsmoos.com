// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudMinimizeController.js
 * @description Adds accessible, persistent folding controls to late-created HUD surfaces.
 * The Awtsmoos is unchanged whether a vessel shines or rests; Awtsmoos.com lets the player fold
 * finite interface chambers away while their gameplay meaning continues without interruption.
 */

import { defaultHudMinimized, hudLayoutRegistry } from './HudLayoutRegistry.js';

const STORAGE_KEY = 'Awtsmoos.mitzvahWorld.hud.v1';
const COMPACT_QUERY = '(max-width: 800px)';

export class HudMinimizeController {
	constructor(documentValue = document, storage = globalThis.localStorage) {
		this.document = documentValue;
		this.storage = storage;
		this.layouts = hudLayoutRegistry();
		this.saved = readSavedState(storage);
		this.observer = null;
		this.syncQueued = false;
	}

	/** Installs one bounded observer because several gameplay components render after page boot. */
	install() {
		this.sync();
		this.observer = new MutationObserver(() => this.queueSync());
		this.observer.observe(this.document.body, { childList: true, subtree: true });
		return this;
	}

	queueSync() {
		if (this.syncQueued) {
			return;
		}
		this.syncQueued = true;
		queueMicrotask(() => {
			this.syncQueued = false;
			this.sync();
		});
	}

	sync() {
		const compact = globalThis.matchMedia?.(COMPACT_QUERY).matches === true;
		for (const definition of this.layouts) {
			const root = this.document.querySelector(definition.selector);
			if (!root) {
				continue;
			}
			this.prepare(root, definition, compact);
		}
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
			writeSavedState(this.storage, this.saved);
			this.apply(root, definition, minimized, button);
		});
		return button;
	}

	apply(root, definition, minimized, knownButton = null) {
		root.dataset.awtsmoosMinimized = String(minimized);
		const button = knownButton
			|| root.querySelector(':scope > .Awtsmoos-hud-minimize');
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
	}
}

function readSavedState(storage) {
	try {
		return JSON.parse(storage?.getItem(STORAGE_KEY) || '{}');
	} catch {
		return {};
	}
}

function writeSavedState(storage, value) {
	try {
		storage?.setItem(STORAGE_KEY, JSON.stringify(value));
	} catch {
		// Storage is optional; the current session remains fully usable without it.
	}
}
