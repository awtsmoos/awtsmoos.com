/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {drawOutlinedText} from '../labels.js';
export function drawHumanRing(ctx,f,color,lang){const speed=Math.min(1,Math.abs(f.vx||0)/12),pulse=1+Math.sin((f.motionClock||0)*.09)*.04+(lang.panic||0)*.12;ctx.strokeStyle=f.danger||lang.panic>.55?'#fff2a8':color;ctx.lineWidth=4+speed*2;ctx.beginPath();ctx.ellipse(f.x,f.y+4,(50+speed*10)*pulse,(12-speed*2)/pulse,0,0,Math.PI*2);ctx.stroke();drawOutlinedText(ctx,'YOU',f.x,f.y-184,18,'#fff7b5')}
