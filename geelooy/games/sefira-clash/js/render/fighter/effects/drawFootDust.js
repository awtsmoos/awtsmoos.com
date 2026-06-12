/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawFootDust(ctx,f,color){const c=f.visualContact;if(!c?.grounded||c.contactPower<.25)return;ctx.save();ctx.globalAlpha=.12+c.contactPower*.16;ctx.fillStyle=color;const x=c.leftPlanted?f.bones.leftCalf?.tip?.x:f.bones.rightCalf?.tip?.x;ctx.beginPath();ctx.ellipse(x||f.x,f.y+5,8+c.contactPower*12,3,0,0,Math.PI*2);ctx.fill();ctx.restore()}
