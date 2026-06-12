/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawPanicPulse(ctx,f){const p=f.poseIntent?.panic||0;if(p<.35)return;ctx.save();ctx.globalAlpha=.1+p*.18;ctx.strokeStyle='#fff2a8';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y-78,34+p*20,60+p*18,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
