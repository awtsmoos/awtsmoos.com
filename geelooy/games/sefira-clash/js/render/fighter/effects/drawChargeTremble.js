/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawChargeTremble(ctx,f){const c=f.chargeGlow||0;if(c<.1)return;ctx.save();ctx.globalAlpha=.12+c*.18;ctx.strokeStyle='#fff2a8';ctx.lineWidth=1+c*4;for(let i=0;i<3;i++){const r=28+c*34+i*7+Math.sin((f.motionClock||0)*.2+i)*4;ctx.beginPath();ctx.arc(f.x,f.y-90,r,0,Math.PI*2);ctx.stroke()}ctx.restore()}
