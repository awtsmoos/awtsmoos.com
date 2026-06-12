/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawDome(ctx,x,y,rx){ctx.beginPath();ctx.ellipse(x,y-17,rx,6,0,Math.PI,Math.PI*2);ctx.fill();ctx.stroke()}
export function drawBrimHat(ctx,x,y,color,brim,height){ctx.fillStyle=color;ctx.fillRect(x-brim/2,y-25,brim,8);ctx.strokeRect(x-brim/2,y-25,brim,8);ctx.fillRect(x-12,y-25-height,24,height);ctx.strokeRect(x-12,y-25-height,24,height)}
export function drawCap(ctx,x,y,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x-2,y-20,19,10,-.15,Math.PI,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(x+18,y-16,15,5,.1,0,Math.PI*2);ctx.fill();ctx.stroke()}
export function drawCrown(ctx,x,y){ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.moveTo(x-18,y-17);ctx.lineTo(x-12,y-39);ctx.lineTo(x,y-24);ctx.lineTo(x+12,y-39);ctx.lineTo(x+18,y-17);ctx.closePath();ctx.fill();ctx.stroke()}
