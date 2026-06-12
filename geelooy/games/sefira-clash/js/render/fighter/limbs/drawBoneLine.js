/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawBoneLine(ctx,bone){if(!bone||bone.id==='root'||bone.id==='head')return;ctx.beginPath();ctx.moveTo(bone.root.x,bone.root.y);ctx.lineTo(bone.tip.x,bone.tip.y);ctx.stroke()}
export function drawOffsetBone(ctx,bone,dx,dy){if(!bone)return;ctx.beginPath();ctx.moveTo(bone.root.x+dx,bone.root.y+dy);ctx.lineTo(bone.tip.x+dx,bone.tip.y+dy);ctx.stroke()}
