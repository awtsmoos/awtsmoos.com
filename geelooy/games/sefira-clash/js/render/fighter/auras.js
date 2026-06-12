/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {radialGlow} from '../lighting/glow.js';import {drawOutlinedText} from './labels.js';import {auraColor} from './colors.js';import {drawHumanRing} from './human/humanRing.js';
export function drawChargeAura(ctx,f,color){const charge=f.chargeGlow||0;if(charge<.05)return;const max=charge>.92,coil=Math.sin((f.motionClock||0)*(.35+charge))*(6+charge*8),r=46+charge*72+coil;ctx.save();ctx.globalAlpha=.18+charge*.38;ctx.strokeStyle=auraColor(f,color);ctx.lineWidth=max?7:3+charge*4;ctx.beginPath();ctx.arc(f.x,f.y-86,r,0,Math.PI*2);ctx.stroke();radialGlow(ctx,f.x,f.y-86,r*.9,max?'#fff2a888':color.replace('hsl','hsla').replace(')',' / .45)'));ctx.restore();if(max)drawOutlinedText(ctx,'MAX',f.x,f.y-225,18,'#fff2a8')}
export const drawPlayerRing=(ctx,f,color,lang)=>drawHumanRing(ctx,f,color,lang);
export function drawDangerAura(ctx,f){const p=34+Math.sin((f.motionClock||0)*.18)*8;radialGlow(ctx,f.x,f.y-92,p,'#ffcf55aa');drawOutlinedText(ctx,'DANGER',f.x,f.y-210,18,'#ffdf70')}
export function drawDodgeStreak(ctx,f,color){ctx.globalAlpha=.34;ctx.strokeStyle=color;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(f.x-(f.vx||0)*4,f.y-95-(f.vy||0)*2);ctx.lineTo(f.x,f.y-95);ctx.stroke();ctx.globalAlpha=1}
export function drawShield(ctx,f){ctx.strokeStyle='#9affc5cc';ctx.lineWidth=4;ctx.beginPath();ctx.arc(f.x+(f.face||1)*22,f.y-82,46,0,Math.PI*2);ctx.stroke()}
export function drawAttackArc(ctx,f,color){const hand=f.bones.rightLowerArm?.tip||{x:f.x+(f.face||1)*50,y:f.y-90},r=f.attack.fullCharge?96:50;radialGlow(ctx,hand.x,hand.y,r,f.attack.fullCharge?'#fff2a888':color.replace('hsl','hsla').replace(')',' / .45)'));ctx.strokeStyle=f.attack.fullCharge?'#fff2a8':color;ctx.lineWidth=f.attack.fullCharge?9:5;ctx.beginPath();ctx.arc(f.x+(f.face||1)*50,f.y-95,f.attack.fullCharge?88:55,-.8,.8);ctx.stroke()}
