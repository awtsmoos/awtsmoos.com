/* B"H
An effect stack applies transforms and descriptors in order. Pixel effects expose
functions; render-time effects remain serializable until a canvas stage consumes them.
*/
import { applyTransformEffect } from './TransformEffect.js';
import { applyCropEffect } from './CropEffect.js';
export function createEffectStack(input = {}) { return { kind:'EffectStack', effects:input.effects || [] }; }
export function addEffect(stack, effect) { stack.effects.push(effect); return effect; }
export function applyEffectStack(target, stack) { for (const effect of stack.effects) { if (effect.kind === 'TransformEffect') applyTransformEffect(target, effect); else if (effect.kind === 'CropEffect') applyCropEffect(target, effect); else target.effects = [...(target.effects || []), effect]; } return target; }
export function enabledEffects(stack) { return stack.effects.filter(e => e.enabled !== false); }
