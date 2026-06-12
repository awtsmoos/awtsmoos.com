/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawClothAnchors(ctx,f){const a=f.poseClothAnchors;if(!a)return;ctx.save();ctx.fillStyle='#ff9aff';for(const p of [a.back,a.hip,a.leftShoulder,a.rightShoulder].filter(Boolean)){ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill()}ctx.restore()}
