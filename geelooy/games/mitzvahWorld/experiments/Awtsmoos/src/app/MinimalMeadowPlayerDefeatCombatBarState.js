// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatCombatBarState.js
 * @description Owns combat-bar messages, cooldown presentation, and finite defeat visibility.
 * The Awtsmoos joins visible consequence with bounded recovery; Awtsmoos.com keeps input
 * orchestration separate while this vessel makes every cast, rejection, fall, and return legible.
 */

import {
	updateMinimalMeadowCastView,
	updateMinimalMeadowCooldownView
} from '../ui/MinimalMeadowCombatBarView.js';

export const MINIMAL_MEADOW_REJECTION_LABELS = Object.freeze({
	ALREADY_CASTING: 'Already casting',
	CAST_INTERRUPTED_RANGE: 'Cast interrupted',
	COOLDOWN: 'Action cooling down',
	PLAYER_DEFEATED: 'Defeated · controls locked',
	TARGET_LOST: 'Target lost',
	TARGET_OUT_OF_RANGE: 'Move closer',
	TARGET_REQUIRED: 'Select a demon first',
	UNKNOWN_ACTION: 'Unknown action'
});

export class MinimalMeadowPlayerDefeatCombatBarState {
	constructor(bus, view) {
		this.bus = bus;
		this.view = view;
		this.casting = null;
		this.cooldowns = {};
		this.defeated = false;
		this.unsubscribers = this.bindEvents();
	}

	bindEvents() {
		return [
			this.bus.on('world:combat-ready', () => this.status('Combat ready · choose a demon')),
			this.bus.on('combat:cast-start', payload => this.showCast(payload)),
			this.bus.on('combat:cast-progress', payload => this.showCast(payload)),
			this.bus.on('combat:cast-launch', payload => this.showLaunch(payload)),
			this.bus.on('combat:cast-cancel', payload => this.showCancel(payload)),
			this.bus.on('combat:impact', payload => this.showImpact(payload)),
			this.bus.on('combat:rejected', payload => this.showRejection(payload)),
			this.bus.on('combat:cooldowns', payload => this.showCooldowns(payload)),
			this.bus.on('player:defeated', payload => this.showDefeat(payload)),
			this.bus.on('player:recovery', () => this.status('Returning to the checkpoint…')),
			this.bus.on('player:respawned', () => this.showRespawn())
		];
	}

	showCast(payload) {
		if (this.defeated) return;
		this.casting = payload;
		updateMinimalMeadowCastView(this.view, payload);
		this.status(`Casting ${payload.label || payload.letters || 'action'}…`);
	}

	showLaunch(payload) {
		this.clearCast();
		if (!this.defeated) this.status(`${payload.letters || 'Action'} launched`);
	}

	showCancel(payload) {
		this.clearCast();
		if (!this.defeated) this.status(labelFor(payload));
	}

	showImpact(payload) {
		if (this.defeated) return;
		const health = Number.isFinite(payload.health)
			? ` · ${Math.max(0, payload.health)} HP`
			: '';
		this.status(`${payload.letters || 'Impact'} struck${health}`);
	}

	showRejection(payload) {
		const remaining = payload.cooldownRemaining
			? ` · ${Number(payload.cooldownRemaining).toFixed(1)}s`
			: '';
		this.status(`${labelFor(payload)}${remaining}`);
	}

	showCooldowns(payload) {
		this.cooldowns = { ...(payload.actions || {}) };
		if (!this.defeated) updateMinimalMeadowCooldownView(this.view, payload);
	}

	showDefeat(payload = {}) {
		this.defeated = true;
		this.clearCast();
		this.setControlsDisabled(true);
		const delay = Number(payload.delaySeconds) || 0;
		this.status(`Defeated · return in ${delay.toFixed(1)}s · press Enter to return now`);
	}

	showRespawn() {
		this.defeated = false;
		this.setControlsDisabled(false);
		updateMinimalMeadowCooldownView(this.view, { actions: this.cooldowns });
		this.status('Recovered at checkpoint · combat ready');
	}

	clearCast() {
		this.casting = null;
		updateMinimalMeadowCastView(this.view, null);
	}

	setControlsDisabled(disabled) {
		for (const button of this.view.buttons.values()) button.disabled = disabled;
		this.view.targetButton.disabled = disabled;
		this.view.root.dataset.defeated = String(disabled);
	}

	status(message) {
		this.view.status.textContent = message;
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}

function labelFor(payload = {}) {
	return MINIMAL_MEADOW_REJECTION_LABELS[payload.reason]
		|| payload.reason
		|| 'Cast cancelled';
}
