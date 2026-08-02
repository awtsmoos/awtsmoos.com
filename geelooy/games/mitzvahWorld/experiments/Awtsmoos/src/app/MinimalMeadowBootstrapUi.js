// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapUi.js
 * @description Mounts essential actions and a deferred real minimap until rich UI replaces them.
 * The Awtsmoos lets the traveler act and recognize nearby souls before ornate panels descend;
 * Awtsmoos.com keeps keyboard, touch, status, map handoff, suspension, and teardown bounded.
 */

import {
	createMinimalMeadowBootstrapMinimap
} from './MinimalMeadowBootstrapMinimap.js';

const ACTIONS = Object.freeze([
	['hebrew-fire', '1', '🔥', 'Hebrew Fire'],
	['letter-light', '2', '☀️', 'Letter Light'],
	['guarded-thought', '3', '🛡️', 'Guarded Thought'],
	['waters-of-purification', '4', '💧', 'Purification']
]);

export class MinimalMeadowBootstrapUi {
	constructor(runtime, documentValue) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.root = documentValue.createElement('section');
		this.root.className = 'minimal-meadow-bootstrap-actions';
		this.root.dataset.bootstrapUi = 'true';
		this.root.setAttribute('aria-label', 'Essential combat actions');
		this.buttons = ACTIONS.map(action => this.createButton(action));
		this.status = documentValue.createElement('p');
		this.status.className = 'minimal-meadow-bootstrap-status';
		this.status.setAttribute('aria-live', 'polite');
		this.status.textContent = 'Movement and essential actions are ready.';
		this.root.append(...this.buttons, this.status);
		runtime.hosts.actionHost.appendChild(this.root);
		this.minimap = createMinimalMeadowBootstrapMinimap(runtime, documentValue);
		this.keyListener = event => this.onKey(event);
		documentValue.addEventListener('keydown', this.keyListener);
		this.unsubscribe = runtime.bus.on('combat:bootstrap-action', receipt => {
			this.status.textContent = `${labelFor(receipt.actionId)} activated.`;
		});
	}

	createButton([actionId, keyLabel, icon, label]) {
		const button = this.documentValue.createElement('button');
		button.type = 'button';
		button.dataset.actionId = actionId;
		button.className = 'action-slot minimal-meadow-bootstrap-action';
		button.setAttribute('aria-label', `${label}, key ${keyLabel}`);
		button.innerHTML = `<span aria-hidden="true">${icon}</span><strong>${keyLabel}</strong>`;
		button.addEventListener('click', () => this.activate(actionId));
		return button;
	}

	activate(actionId) {
		if (this.root.dataset.suspended === 'true') return;
		this.runtime.bus.emit('combat:activate', { actionId, source: 'bootstrap-ui' });
	}

	onKey(event) {
		const action = ACTIONS.find(([, keyLabel]) => keyLabel === event.key);
		if (!action || event.repeat) return;
		this.activate(action[0]);
	}

	refresh() {
		this.status.textContent = `Health ${Math.round(this.runtime.playerStats.health)} · Stamina ${Math.round(this.runtime.playerStats.stamina)}`;
		this.minimap.refresh();
	}

	diagnostics() {
		return Object.freeze({
			bootstrap: true,
			buttons: this.buttons.length,
			minimap: this.minimap.diagnostics(),
			suspended: this.root.dataset.suspended === 'true'
		});
	}

	releaseMinimap() {
		this.minimap.release();
	}

	suspend() {
		this.root.dataset.suspended = 'true';
		for (const button of this.buttons) button.disabled = true;
	}

	resume() {
		this.root.dataset.suspended = 'false';
		for (const button of this.buttons) button.disabled = false;
	}

	destroy() {
		this.unsubscribe?.();
		this.minimap.destroy();
		this.documentValue.removeEventListener('keydown', this.keyListener);
		this.root.remove();
	}
}

function labelFor(actionId) {
	return ACTIONS.find(([id]) => id === actionId)?.[3] || actionId;
}
