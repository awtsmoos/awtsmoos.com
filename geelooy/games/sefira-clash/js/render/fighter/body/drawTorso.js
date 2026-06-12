/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawTorso(ctx,f,color,language){const spine=f.bones.spine,chest=spine?.tip||{x:f.x,y:f.y-128},squash=language.torsoSquash||1;ctx.fillStyle='rgba(0,0,0,.84)';ctx.strokeStyle=color;ctx.lineWidth=3;ctx.save();ctx.translate(chest.x+language.damageWobble,chest.y+34+language.breath);ctx.rotate(language.lean||0);ctx.beginPath();ctx.ellipse(0,0,22+language.confidence*3,45/squash,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}
