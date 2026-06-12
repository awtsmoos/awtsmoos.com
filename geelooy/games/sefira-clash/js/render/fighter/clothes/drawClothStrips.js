/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function drawClothStrips(ctx,f,color){const h=f.clothState?.hem;if(!h?.length)return;ctx.save();ctx.globalAlpha=.32;ctx.strokeStyle=f.visualStyle?.clothing?.trim||color;ctx.lineWidth=3;for(const p of h){ctx.beginPath();ctx.moveTo(f.x,f.y-60);ctx.lineTo(p.x,p.y);ctx.stroke()}ctx.restore()}
