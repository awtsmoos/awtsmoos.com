/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawHandsFeet(ctx,f,color,language={}){ctx.fillStyle=color;for(const id of ['leftLowerArm','rightLowerArm'])drawOvalTip(ctx,f.bones[id],language.handSize||7,5);for(const id of ['leftCalf','rightCalf'])drawOvalTip(ctx,f.bones[id],language.footSize||11,5)}
function drawOvalTip(ctx,bone,rx,ry){if(!bone)return;ctx.beginPath();ctx.ellipse(bone.tip.x,bone.tip.y,rx,ry,0,0,Math.PI*2);ctx.fill()}
