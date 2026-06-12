/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
import {drawBoneLine} from './drawBoneLine.js';
export function drawSkeletonLayer(ctx,f,stroke,width){ctx.strokeStyle=stroke;ctx.lineWidth=width;for(const bone of Object.values(f.bones))drawBoneLine(ctx,bone)}
