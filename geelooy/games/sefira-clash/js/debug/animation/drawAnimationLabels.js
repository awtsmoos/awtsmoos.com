/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawAnimationLabels(ctx,f){ctx.save();ctx.fillStyle='#fff';ctx.font='10px monospace';ctx.fillText((f.anim?.kind||'?')+' '+(f.poseIntent?.mood||'?'),f.x-32,f.y-210);ctx.restore()}
