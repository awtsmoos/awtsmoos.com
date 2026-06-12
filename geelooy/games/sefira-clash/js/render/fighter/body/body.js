/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
import {drawShadow} from './drawShadow.js';import {drawTorso} from './drawTorso.js';import {drawHips} from './drawHips.js';import {drawDamageWobble} from './drawDamageWobble.js';
export function drawBodyMass(ctx,f,color,language){drawShadow(ctx,f,color,language);drawTorso(ctx,f,color,language);drawHips(ctx,f,color,language);drawDamageWobble(ctx,f,color,language)}
