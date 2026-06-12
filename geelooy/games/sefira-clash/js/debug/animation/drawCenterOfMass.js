/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawCenterOfMass(ctx,f){const m=f.visualStyle?.mass;if(!m)return;ctx.save();ctx.fillStyle='#ffef77';ctx.beginPath();ctx.arc(f.x,f.y-83,4,0,Math.PI*2);ctx.fill();ctx.restore()}
