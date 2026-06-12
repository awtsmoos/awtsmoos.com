/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
import {drawLandingDust} from './drawLandingDust.js';import {drawFootDust} from './drawFootDust.js';import {drawAttackWind} from './drawAttackWind.js';import {drawChargeTremble} from './drawChargeTremble.js';import {drawPanicPulse} from './drawPanicPulse.js';import {drawHunterGlint} from './drawHunterGlint.js';import {drawContactPulse} from './drawContactPulse.js';
export function drawBackEffects(ctx,f,color){drawLandingDust(ctx,f);drawFootDust(ctx,f,color);drawContactPulse(ctx,f)}
export function drawFrontEffects(ctx,f,color){drawAttackWind(ctx,f,color);drawChargeTremble(ctx,f);drawPanicPulse(ctx,f);drawHunterGlint(ctx,f)}
