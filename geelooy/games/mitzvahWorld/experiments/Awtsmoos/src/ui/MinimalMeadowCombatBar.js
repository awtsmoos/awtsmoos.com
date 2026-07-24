// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBar.js
 * @description Binds keys, buttons, cast progress, cooldowns, launch, impact, and target cycling.
 * The Awtsmoos joins hand, keyboard, visible meter, and fictional deed in one measured truth;
 * Awtsmoos.com keeps every action responsive without allowing UI input to leak into the world.
 */

import { minimalMeadowCombatActionList } from '../app/MinimalMeadowCombatActions.js';
import {
	createMinimalMeadowCombatBarView,
	updateMinimalMeadowCastView,
	updateMinimalMeadowCooldownView
} from './MinimalMeadowCombatBarView.js';

const REJECTION_LABELS = Object.freeze({
	ALREADY_CASTING: 'Already casting',
	CAST_INTERRUPTED_RANGE: 'Cast interrupted',
	COOLDOWN: 'Action cooling down',
	TARGET_LOST: 'Target lost',
	TARGET_OUT_OF_RANGE: 'Move closer',
	TARGET_REQUIRED: 'Select a demon first',
	UNKNOWN_ACTION: 'Unknown action'
});

export class MinimalMeadowCombatBar {
	constructor(host, bus, environment = globalThis) {
		this.host = host;
		this.bus = bus;
		this.environment = environment;
		this.actions = minimalMeadowCombatActionList();
		this.view = createMinimalMeadowCombatBarView(host);
		this.casting = null;
		this.cooldowns = {};
		this.onClick = event => this.handleClick(event);
		this.onKeyDown = event => this.handleKeyDown(event);
		this.view.root.addEventListener('click', this.onClick);
		environment.addEventListener?.('keydown', this.onKeyDown);
		this.unsubscribers = this.bindEvents();
	}

	bindEvents() {
		return [
			this.bus.on('world:combat-ready', () => this.setStatus('Combat ready · choose a demon')),
			this.bus.on('combat:cast-start', payload => this.showCast(payload)),
			this.bus.on('combat:cast-progress', payload => this.showCast(payload)),
			this.bus.on('combat:cast-launch', payload => this.showLaunch(payload)),
			this.bus.on('combat:cast-cancel', payload => this.showCancel(payload)),
			this.bus.on('combat:impact', payload => this.showImpact(payload)),
			this.bus.on('combat:rejected', payload => this.showRejection(payload)),
			this.bus.on('combat:cooldowns', payload => this.showCooldowns(payload))
		];
	}

	handleClick(event) {
		const button = event.target.closest('button');
		if (!button || button.disabled) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		if (button.dataset.actionId) {
			this.activate(button.dataset.actionId);
			return;
		}
		if (button.dataset.targetCycle) {
			this.bus.emit('target:cycle', {});
			return;
		}
		if (button.dataset.collapse) {
			const collapsed = this.view.bar.dataset.collapsed !== 'true';
			this.view.bar.dataset.collapsed = String(collapsed);
			button.textContent = collapsed ? '+' : '−';
		}
	}

	handleKeyDown(event) {
		if (event.repeat || isTextEntry(event.target)) {
			return;
		}
		const action = this.actions.find(candidate => candidate.keyCode === event.code);
		if (action) {
			event.preventDefault();
			this.activate(action.id);
			return;
		}
		if (event.code === 'Tab') {
			event.preventDefault();
			this.bus.emit('target:cycle', {});
		}
	}

	activate(actionId) {
		this.bus.emit('combat:activate', { actionId, source: 'action-bar' });
	}

	showCast(payload) {
		this.casting = payload;
		updateMinimalMeadowCastView(this.view, payload);
		this.setStatus(`Casting ${payload.label || payload.letters || 'action'}…`);
	}

	showLaunch(payload) {
		this.casting = null;
		updateMinimalMeadowCastView(this.view, null);
		this.setStatus(`${payload.letters || 'Action'} launched`);
	}

	showCancel(payload) {
		this.casting = null;
		updateMinimalMeadowCastView(this.view, null);
		this.setStatus(REJECTION_LABELS[payload.reason] || payload.reason || 'Cast cancelled');
	}

	showImpact(payload) {
		const health = Number.isFinite(payload.health) ? ` · ${Math.max(0, payload.health)} HP` : '';
		this.setStatus(`${payload.letters || 'Impact'} struck${health}`);
	}

	showRejection(payload) {
		const remaining = payload.cooldownRemaining
			? ` · ${Number(payload.cooldownRemaining).toFixed(1)}s`
			: '';
		this.setStatus(`${REJECTION_LABELS[payload.reason] || payload.reason}${remaining}`);
	}

	showCooldowns(payload) {
		this.cooldowns = { ...(payload.actions || {}) };
		updateMinimalMeadowCooldownView(this.view, payload);
	}

	setStatus(message) {
		this.view.status.textContent = message;
	}

	diagnostics() {
		return {
			buttons: this.view.buttons.size,
			casting: this.casting?.actionId || null,
			cooldowns: { ...this.cooldowns },
			status: this.view.status.textContent
		};
	}

	destroy() {
		this.view.root.removeEventListener('click', this.onClick);
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
		this.host.replaceChildren();
	}
}

function isTextEntry(target) {
	return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
}
