/** B"H @module BattleFxDrawers - routes timed effects to focused drawers. */
import { drawAura, drawBurst, drawProjectile } from './BattleFxMotion.js';
import { drawConsequence, drawReward } from './BattleFxOverlayDrawers.js';

export const drawBackEffect = (ctx, effect) => {
	if (['aura', 'shield', 'enemy'].includes(effect.type)) drawAura(ctx, effect);
	if (effect.type === 'projectile') drawProjectile(ctx, effect);
};

export const drawFrontEffect = (ctx, effect) => {
	if (['burst', 'hit'].includes(effect.type)) drawBurst(ctx, effect);
	if (effect.type === 'damage' || effect.type === 'heal') drawConsequence(ctx, effect);
	if (effect.type === 'reward') drawReward(ctx, effect);
};
