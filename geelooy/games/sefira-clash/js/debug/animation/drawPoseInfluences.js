/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawPoseInfluences(ctx,f){const forces=f.visualStyle?.forces;if(!forces)return;ctx.save();ctx.fillStyle='#fff';ctx.font='10px monospace';ctx.fillText('force '+Math.round((forces.hipToChest||0)*100),f.x+20,f.y-130);ctx.restore()}
