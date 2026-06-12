/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawFootPlants(ctx,f){const c=f.visualContact;if(!c)return;ctx.save();ctx.strokeStyle=c.leftPlanted?'#7cff9a':'#ff7c7c';ctx.strokeRect((c.leftPlanted?f.bones.leftCalf?.tip?.x:f.bones.rightCalf?.tip?.x)||f.x,f.y,10,5);ctx.restore()}
