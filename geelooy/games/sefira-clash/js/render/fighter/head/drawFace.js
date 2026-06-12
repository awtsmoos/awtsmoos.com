/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawFace(ctx,f,x,y,color,language){ctx.fillStyle='#080609';ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,language.headSize||18,0,Math.PI*2);ctx.fill();ctx.stroke()}
