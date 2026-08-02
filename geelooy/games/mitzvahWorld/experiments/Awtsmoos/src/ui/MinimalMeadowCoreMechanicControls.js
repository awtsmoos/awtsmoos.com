// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanicControls.js
 * @description Mounts one persistent keyboard/mobile surface for dodge, lock, consumable, and pickup.
 * The Awtsmoos joins intention and touch without multiplying authorities;
 * Awtsmoos.com remounts one existing root after rich host composition without duplicating listeners.
 */

import {
	MINIMAL_MEADOW_CORE_ACTIONS,
	minimalMeadowCoreActionForKey,
	minimalMeadowCoreTextEntry,
	subscribeMinimalMeadowCoreFeedback
} from './MinimalMeadowCoreMechanicControlSupport.js';
import {
	installMinimalMeadowCoreMechanicStyles
} from './MinimalMeadowCoreMechanicStyles.js';

export class MinimalMeadowCoreMechanicControls {
	constructor(runtime, documentValue) {
		this.runtime = runtime;
		this.document = documentValue;
		installMinimalMeadowCoreMechanicStyles(documentValue);
		this.root = documentValue.createElement('section');
		this.root.className = 'Awtsmoos-core-mechanics';
		this.root.setAttribute('aria-label', 'Core gameplay actions');
		this.buttons = MINIMAL_MEADOW_CORE_ACTIONS.map(action => {
			return this.createButton(action);
		});
		this.status = documentValue.createElement('p');
		this.status.className = 'Awtsmoos-core-mechanic-status';
		this.status.setAttribute('aria-live', 'polite');
		this.status.textContent = 'Dodge, lock, recovery, and pickup ready.';
		this.root.append(...this.buttons, this.status);
		this.mount();
		this.onKeyDown = event => this.handleKey(event);
		documentValue.addEventListener('keydown', this.onKeyDown);
		this.unsubscribers = subscribeMinimalMeadowCoreFeedback(
			runtime,
			message => { this.status.textContent = message; }
		);
	}

	createButton(action) {
		const button = this.document.createElement('button');
		button.type = 'button';
		button.className = 'Awtsmoos-core-mechanic-button';
		button.dataset.coreMechanic = action.event;
		button.setAttribute('aria-label', `${action.label}, ${action.key}`);
		button.innerHTML = `<span aria-hidden="true">${action.icon}</span><strong>${action.key}</strong>`;
		button.addEventListener('click', () => this.activate(action.event));
		return button;
	}

	activate(eventName) {
		this.runtime.bus.emit(eventName, { source: 'core-controls' });
	}

	handleKey(event) {
		if (event.repeat || minimalMeadowCoreTextEntry(event.target)) return;
		const eventName = minimalMeadowCoreActionForKey(event);
		if (!eventName) return;
		event.preventDefault?.();
		this.activate(eventName);
	}

	mount() {
		const host = this.runtime.hosts?.actionHost;
		if (host && this.root.parentNode !== host) host.appendChild(this.root);
		return this.root.parentNode === host;
	}

	refresh() {
		this.mount();
		const consumable = this.runtime.consumables?.snapshot?.();
		this.root.dataset.lootNearby = String(Boolean(
			this.runtime.lootDrops?.nearestDrop?.()
		));
		this.root.dataset.locked = String(Boolean(this.runtime.lockOn?.targetId));
		this.root.dataset.consumable = consumable?.selectedItemId || 'none';
	}

	diagnostics() {
		return Object.freeze({
			buttons: this.buttons.length,
			mounted: this.root.parentNode === this.runtime.hosts?.actionHost
		});
	}

	destroy() {
		this.document.removeEventListener('keydown', this.onKeyDown);
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
		this.root.remove();
	}
}
