/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawDamageWobble(ctx,f,color,language){if(!language.damageWobble)return;const h=f.bones.head?.tip||{x:f.x,y:f.y-170};ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle='#fff2a8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.x+language.damageWobble,h.y,22,0,Math.PI*2);ctx.stroke();ctx.restore()}
