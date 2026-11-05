// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyDefense.js
 * @description Resolves guard mitigation, posture pressure, breaks, immunity, and recovery.
 * The Awtsmoos distinguishes life from stability while renewing both each instant;
 * Awtsmoos.com gives incomplete actors lawful defense and lets every positive unblocked strike be felt.
 */

const BREAK_MILLISECONDS = 1400;

export function createMinimalEnemyDefense(profile = {}) {
	const maximum = Math.max(1, Number(
		profile.postureMaximum || profile.maxHealth * 0.62 || 60
	));
	return {
		brokenUntil: 0,
		immunityUntil: 0,
		maximum,
		value: maximum
	};
}

export function resolveMinimalEnemyDefense(actor, amount, detail = {}) {
	const defense = ensureMinimalEnemyDefense(actor);
	const now = actorNow(actor);
	const incoming = Math.max(0, Number(amount || 0));
	const pressure = posturePressure(incoming, detail);
	const guarding = enemyIsGuarding(actor, now);
	if (now >= defense.immunityUntil) {
		defense.value = Math.max(0, defense.value - pressure);
	}
	let broken = now < defense.brokenUntil;
	if (!broken && defense.value === 0 && now >= defense.immunityUntil) {
		defense.brokenUntil = now + BREAK_MILLISECONDS;
		defense.immunityUntil = defense.brokenUntil
			+ Number(actor.profile?.antiStunlockMilliseconds || 1800);
		broken = true;
	}
	const guardReduction = guarding && !broken
		? Math.max(0, Math.min(0.72, Number(actor.profile?.guardStrength || 0)))
		: 0;
	const reducedDamage = Math.round(
		incoming * (1 - guardReduction) * (broken ? 1.22 : 1)
	);
	const healthDamage = incoming > 0 ? Math.max(1, reducedDamage) : 0;
	const receipt = defenseReceipt(actor, {
		broken,
		guarded: guardReduction > 0,
		healthDamage,
		incoming,
		pressure
	});
	actor.runtime?.bus?.emit?.('combat:posture', receipt);
	return receipt;
}

export function updateMinimalEnemyDefense(actor, deltaSeconds) {
	const defense = ensureMinimalEnemyDefense(actor);
	const now = actorNow(actor);
	if (now < defense.brokenUntil || defense.value >= defense.maximum) return;
	const recovery = defense.maximum * Math.max(0, Number(deltaSeconds || 0)) * 0.11;
	defense.value = Math.min(defense.maximum, defense.value + recovery);
}

export function minimalEnemyDefenseSnapshot(actor) {
	const defense = ensureMinimalEnemyDefense(actor);
	const now = actorNow(actor);
	return Object.freeze({
		broken: now < defense.brokenUntil,
		brokenUntil: defense.brokenUntil,
		guarded: enemyIsGuarding(actor, now),
		immunityUntil: defense.immunityUntil,
		maximum: defense.maximum,
		value: Number(defense.value.toFixed(2))
	});
}

function ensureMinimalEnemyDefense(actor) {
	actor.defense ||= createMinimalEnemyDefense(actor.profile || {});
	return actor.defense;
}

function enemyIsGuarding(actor, now) {
	const defense = ensureMinimalEnemyDefense(actor);
	if (now < defense.brokenUntil) return false;
	if (Number(actor.profile?.guardStrength || 0) <= 0) return false;
	return /guard|idle|approach|recovery/.test(actor.action || 'idle');
}

function posturePressure(amount, detail) {
	const actionId = detail.actionId || detail.action?.id || '';
	const stagger = Math.max(0, Number(detail.stagger || detail.localAction?.stagger || 0));
	const multiplier = /heavy|shove|finish/.test(actionId) ? 1.7 : 0.62;
	return Math.max(1, amount * multiplier + stagger * 12);
}

function defenseReceipt(actor, values) {
	return Object.freeze({
		...values,
		maximum: actor.defense.maximum,
		reason: values.broken ? 'broken' : values.guarded ? 'guarded' : 'strained',
		targetId: actor.profile?.id || actor.id || null,
		value: Number(actor.defense.value.toFixed(2))
	});
}

function actorNow(actor) {
	return Math.round(Number(actor.combat?.session?.elapsed || 0) * 1000);
}
