/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawJointBridges(ctx,f,color){drawJointLine(ctx,f.bones.leftShoulder,f.bones.rightShoulder,color);drawJointLine(ctx,f.bones.leftThigh,f.bones.rightThigh,color)}
function drawJointLine(ctx,a,b,color){if(!a||!b)return;ctx.strokeStyle=color;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(a.root.x,a.root.y);ctx.lineTo(b.root.x,b.root.y);ctx.stroke()}
