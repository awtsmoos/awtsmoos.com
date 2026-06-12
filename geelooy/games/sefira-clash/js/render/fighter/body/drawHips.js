/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
export function drawHips(ctx,f,color,language){const hip=f.bones.spine?.root||{x:f.x,y:f.y-56};ctx.fillStyle='rgba(0,0,0,.84)';ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(hip.x,hip.y+6,25+language.panic*5,13+language.panic*3,(language.lean||0)*.4,0,Math.PI*2);ctx.fill();ctx.stroke()}
