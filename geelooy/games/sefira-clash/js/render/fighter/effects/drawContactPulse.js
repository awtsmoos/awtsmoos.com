/**
 * B"H
 * Hyper-real render cue vessel. Visual-only sparks around existing gameplay.
 */
export function drawContactPulse(ctx,f){const c=f.visualContact;if(!c?.grounded)return;ctx.save();ctx.globalAlpha=.1+(c.contactPower||0)*.14;ctx.strokeStyle='#ffffff88';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(f.x-18,f.y+3);ctx.lineTo(f.x+18,f.y+3);ctx.stroke();ctx.restore()}
