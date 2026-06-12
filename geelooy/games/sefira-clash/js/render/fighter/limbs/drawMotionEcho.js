/**
 * B"H
 * Hyper-real helper vessel: visual-only mapped completion.
 */
export function drawMotionEcho(ctx,f,color){if(Math.abs(f.vx||0)<7&&!f.attack)return;ctx.save();ctx.globalAlpha=.1;ctx.strokeStyle=color;ctx.lineWidth=3;const dx=-(f.vx||0)*3,dy=-(f.vy||0)*2;for(const id of ['leftLowerArm','rightLowerArm','leftCalf','rightCalf']){const b=f.bones[id];if(!b)continue;ctx.beginPath();ctx.moveTo(b.root.x+dx,b.root.y+dy);ctx.lineTo(b.tip.x+dx,b.tip.y+dy);ctx.stroke()}ctx.restore()}
