/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
import {drawRobe} from './drawRobe.js';import {drawCoat} from './drawCoat.js';import {drawScarf} from './drawScarf.js';import {drawCapelet} from './drawCapelet.js';import {drawSleeves} from './drawSleeves.js';import {drawClothStrips} from './drawClothStrips.js';
export function drawClothes(ctx,f,color,layer='back'){const k=f.visualStyle?.clothing?.kind;if(!f.clothState||!k)return;if(layer==='back'){if(k==='capelet')drawCapelet(ctx,f,color);if(k==='scarf')drawScarf(ctx,f,color);if(k==='robe')drawRobe(ctx,f,color)}else{if(k==='shortCoat'||k==='tunic')drawCoat(ctx,f,color);if(k==='strips')drawClothStrips(ctx,f,color);drawSleeves(ctx,f,color)}}
