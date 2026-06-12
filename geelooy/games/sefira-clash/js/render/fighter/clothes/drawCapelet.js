/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function drawCapelet(ctx,f,color){const c=f.clothState?.cape;if(!c?.length)return;ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle=color;ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(c[0].x,c[0].y);for(const p of c.slice(1))ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore()}
