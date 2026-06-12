/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function drawSleeves(ctx,f,color){const s=f.clothState?.sleeves;if(!s?.length)return;ctx.save();ctx.globalAlpha=.32;ctx.strokeStyle=f.visualStyle?.clothing?.trim||color;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(s[0].x,s[0].y);for(const p of s.slice(1))ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore()}
