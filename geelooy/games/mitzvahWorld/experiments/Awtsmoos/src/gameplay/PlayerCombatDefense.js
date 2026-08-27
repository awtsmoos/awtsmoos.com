// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerCombatDefense.js
 * @description Resolves physical guard, parry, ward, protection, and resistance.
 * The Awtsmoos is the true protection; Awtsmoos.com begins every timer inactive,
 * measures direction, spends guard stamina, and reports each finite mitigation.
 */
import { createCombatDamageEvent } from './CombatDamageEvent.js';
import { PhysicalGuardState } from './PhysicalGuardState.js';

const INACTIVE = Number.NEGATIVE_INFINITY;

export class PlayerCombatDefense {
	constructor(options = {}) {
		this.guard = new PhysicalGuardState(Number(options.guardStamina) || 100);
		this.perfectWardUntil = INACTIVE;
		this.protectionUntil = INACTIVE;
		this.wardUntil = INACTIVE;
		this.stats = options.stats || {};
	}
	activateWard(now, options = {}) {
		this.perfectWardUntil = now + finite(options.perfectSeconds, 0.22);
		this.wardUntil = now + finite(options.wardSeconds, 0.9);
	}
	activateProtection(now, seconds = 5) {
		this.protectionUntil = Math.max(this.protectionUntil, now + seconds);
	}
	beginGuard(now, options = {}) {
		return this.guard.begin(now, options);
	}
	endGuard(now, recovery = 0.2) {
		this.guard.end(now, recovery);
	}
	update(delta, now) {
		const rate = finite(this.stats.guardRegeneration, 18);
		this.guard.regenerate(delta, rate, now);
	}
	resolveIncoming(event, now) {
		const spiritual = this.resolveSpiritual(event, now);
		if (spiritual) return spiritual;
		const physical = this.resolvePhysical(event, now);
		if (physical) return physical;
		return this.resisted(event);
	}
	resolveSpiritual(event, now) {
		const perfectWard = now <= this.perfectWardUntil;
		const warded = now <= this.wardUntil;
		const protectedValue = now <= this.protectionUntil;
		const multiplier = perfectWard ? 0 : warded ? 0.3 : protectedValue ? 0.65 : 1;
		if (multiplier === 1) return null;
		return damage(event, multiplier, {
			mitigationSource: perfectWard ? 'perfect-ward' : warded ? 'ward' : 'protection',
			perfectWard,
			staggerAmount: perfectWard ? 0 : event.staggerAmount
		});
	}
	resolvePhysical(event, now) {
		const state = this.guard.snapshot(now);
		if (!state.blocked || !directionProtected(state.facing, event.hitDirection)) return null;
		const perfectBlock = state.parry;
		const strength = clamp(finite(this.stats.blockStrength, 0.55), 0, 0.9);
		const cost = Number(event.amount || 0) + Number(event.staggerAmount || 0) * 4;
		const guardBroken = this.guard.absorb(perfectBlock ? cost * 0.2 : cost, now);
		const multiplier = perfectBlock ? 0 : guardBroken ? 1 : 1 - strength;
		return damage(event, multiplier, {
			guardBroken,
			mitigationSource: perfectBlock ? 'parry' : guardBroken ? 'guard-break' : 'physical-guard',
			perfectBlock,
			staggerAmount: perfectBlock ? 0 : event.staggerAmount
		});
	}
	resisted(event) {
		const key = resistanceKey(event.damageType);
		const resistance = clamp(finite(this.stats[key], 0), 0, 0.85);
		return damage(event, 1 - resistance, { mitigationSource: resistance ? key : null });
	}
	snapshot(now) {
		return Object.freeze({
			...this.guard.snapshot(now),
			perfectWard: now <= this.perfectWardUntil,
			protected: now <= this.protectionUntil,
			warded: now <= this.wardUntil
		});
	}
}

function damage(event, multiplier, extra) {
	return createCombatDamageEvent({
		...event,
		...extra,
		amount: Number(event.amount || 0) * multiplier,
		blocked: multiplier < 1
	}, event.timestamp);
}
function directionProtected(facing, direction = {}) {
	if (!direction.x && !direction.z) return true;
	const incoming = Math.atan2(-direction.x, -direction.z);
	return Math.abs(normalize(incoming - facing)) <= Math.PI * 0.6;
}
function resistanceKey(type = '') {
	if (/spiritual|symbolic|torah/i.test(type)) return 'spiritualResistance';
	if (/ranged|projectile/i.test(type)) return 'rangedResistance';
	if (/area|aoe/i.test(type)) return 'areaResistance';
	return 'physicalResistance';
}
function normalize(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}
function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
