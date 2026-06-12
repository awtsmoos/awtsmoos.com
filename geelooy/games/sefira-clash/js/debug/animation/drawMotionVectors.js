/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawMotionVectors(ctx,f){ctx.save();ctx.strokeStyle='#9ad7ff';ctx.beginPath();ctx.moveTo(f.x,f.y-80);ctx.lineTo(f.x+(f.vx||0)*4,f.y-80+(f.vy||0)*4);ctx.stroke();ctx.restore()}
