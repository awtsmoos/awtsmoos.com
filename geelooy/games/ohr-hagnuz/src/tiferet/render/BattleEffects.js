/**
 * B"H
 * @module BattleEffects
 * @description Timed battle auras, projectiles, impacts, numbers, healing, rewards, and shake.
 *
 * Intention gathers as an aura, crosses the space as a living letter, strikes,
 * and leaves a visible consequence. No turn is merely a hidden subtraction.
 */
import { State } from '../../binah/State.js';
import { drawBackEffect, drawFrontEffect } from './battle/BattleFxDrawers.js';

const DURATION = Object.freeze({
	aura: 32,
	shield: 34,
	enemy: 34,
	projectile: 36,
	burst: 30,
	hit: 30,
	damage: 48,
	heal: 52,
	reward: 108
});

export const pushBattleEffect = (type, target, text = '', options = {}) => {
	State.BattleFx ||= [];
	const ttl = options.ttl || DURATION[type] || 30;
	const effect = {
		type,
		target,
		text,
		ttl,
		maxTtl: ttl,
		source: options.source || null,
		color: options.color || null,
		id: `${Date.now()}-${Math.random()}`
	};
	State.BattleFx.push(effect);
	return effect;
};

export const pushRewardEffect = text => pushBattleEffect('reward', 'center', text);

export const battleShake = () => {
	const amount = Math.max(0, Number(State.Debate?.fxShake || 0));
	if (!amount) return { x: 0, y: 0 };
	State.Debate.fxShake = Math.max(0, amount - 0.42);
	return {
		x: (Math.random() - 0.5) * amount,
		y: (Math.random() - 0.5) * amount
	};
};

const drawEffectLayer = (ctx, effect, layer) => {
	if (layer === 'back') drawBackEffect(ctx, effect);
	if (layer === 'front') drawFrontEffect(ctx, effect);
};

const ageEffects = () => {
	for (const effect of State.BattleFx || []) effect.ttl -= 1;
	State.BattleFx = (State.BattleFx || []).filter(effect => effect.ttl > 0);
};

export const drawBattleEffects = (ctx, layer = 'front') => {
	for (const effect of State.BattleFx || []) drawEffectLayer(ctx, effect, layer);
	if (layer === 'front') ageEffects();
};
