/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawShadow(ctx,f,color,language){ctx.save();ctx.globalAlpha=.18+(f.grounded?.12:0);ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(f.x,f.y+8,42+Math.abs(f.vx||0)*.6,9,0,0,Math.PI*2);ctx.fill();ctx.restore()}
