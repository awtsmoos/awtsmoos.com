/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
import {drawDome,drawBrimHat,drawCap,drawCrown} from './headwearShapes.js';
export function drawHeadwear(ctx,f,x,y,color){const kind=f.cosmetic?.headwear||'kippah';ctx.save();ctx.strokeStyle='#050207';ctx.lineWidth=4;ctx.fillStyle=color;if(kind==='kippah'||kind==='turban')drawDome(ctx,x,y,kind==='turban'?17:13);else if(kind==='blackhat')drawBrimHat(ctx,x,y,color,40,24);else if(kind==='tophat')drawBrimHat(ctx,x,y,color,46,34);else if(kind==='cap')drawCap(ctx,x,y,color);else if(kind==='crown')drawCrown(ctx,x,y);else drawDome(ctx,x,y,13);ctx.restore()}
