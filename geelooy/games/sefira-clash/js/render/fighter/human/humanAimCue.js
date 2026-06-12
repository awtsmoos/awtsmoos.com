/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export function drawHumanAimCue(ctx,f,color){if(!f.human||(!f.attack&&(f.chargeGlow||0)<.08))return;const a=f.attack?.aim||{x:f.face||1,y:0},l=38+(f.chargeGlow||0)*32,m=Math.hypot(a.x||0,a.y||0)||1;ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle='#fff7b5';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x,f.y-104);ctx.lineTo(f.x+a.x/m*l,f.y-104+a.y/m*l);ctx.stroke();ctx.restore()}
