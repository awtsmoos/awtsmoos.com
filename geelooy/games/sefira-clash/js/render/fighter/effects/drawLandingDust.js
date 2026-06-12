/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawLandingDust(ctx,f){const k=f.visualStyle?.recoil?.landingRecoil||f.anim?.landingImpact||0;if(k<=.05)return;ctx.save();ctx.globalAlpha=.18+.25*k;ctx.strokeStyle='#fff7b566';ctx.lineWidth=2+4*k;ctx.beginPath();ctx.ellipse(f.x,f.y+5,24+42*k,5+8*k,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
