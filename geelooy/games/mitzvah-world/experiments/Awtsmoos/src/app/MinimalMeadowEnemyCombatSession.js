// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatSession.js
 * @description Remembers spawn home, role, target, leash loss, and explicit encounter transitions.
 * The Awtsmoos anchors pursuit to the demon's revealed place rather than an unborn group origin;
 * Awtsmoos.com keeps one target through brief distance and sight changes until true loss closes it.
 */

import {
	minimalEnemyDecisionOffset,
	selectMinimalEnemyRole
} from './MinimalMeadowEnemyRolePolicy.js';

export class MinimalMeadowEnemyCombatSession {
	constructor(actor) {
		this.actor = actor;
		this.home = Object.freeze(minimalEnemyCombatHome(actor));
		this.reset('created');
	}

	engage(reason = 'aggro') {
		if (this.active) return false;
		this.active = true;
		this.role = selectMinimalEnemyRole(this.actor.profile);
		this.targetId = 'player';
		this.lossTime = 0;
		this.elapsed = 0;
		this.openingDelay = minimalEnemyDecisionOffset(this.actor.profile);
		this.transition('alerted', reason);
		return true;
	}

	tick(deltaSeconds) {
		const delta = Math.min(0.08, Math.max(0, Number(deltaSeconds) || 0));
		this.elapsed += delta;
		this.stateTime += delta;
		return delta;
	}

	observe(visible, withinLeash, deltaSeconds) {
		if (visible && withinLeash) {
			this.lossTime = 0;
			return;
		}
		this.lossTime += Math.max(0, Number(deltaSeconds) || 0);
	}

	transition(state, reason = 'policy') {
		if (state === this.state) return false;
		this.lastTransition = Object.freeze({
			from: this.state,
			reason,
			to: state
		});
		this.state = state;
		this.stateTime = 0;
		return true;
	}

	reset(reason = 'target-lost') {
		const prior = this.state || 'none';
		this.active = false;
		this.elapsed = 0;
		this.lossTime = 0;
		this.openingDelay = 0;
		this.role = null;
		this.state = 'patrol';
		this.stateTime = 0;
		this.targetId = null;
		this.lastTransition = Object.freeze({ from: prior, reason, to: 'patrol' });
	}
}

export function minimalEnemyCombatHome(actor) {
	const profileX = finite(actor.profile?.x);
	const profileZ = finite(actor.profile?.z);
	return {
		x: profileX ?? finite(actor.group?.position?.x) ?? 0,
		z: profileZ ?? finite(actor.group?.position?.z) ?? 0
	};
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}
