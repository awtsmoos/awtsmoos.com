/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function drawCoat(ctx,f,color){const h=f.clothState?.hem;if(!h?.length)return;ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle=color;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(f.x-14,f.y-92);for(const p of h)ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore()}
