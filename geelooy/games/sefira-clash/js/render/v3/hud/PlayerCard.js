/**
 * B"H
 * V3 strong player card.
 *
 * Chapter 235: percentages return as the crown of the screen.
 */
import { drawStockDots } from './StockDots.js';
function hue(f){return 'hsl('+f.dna.hue+' 92% 62%)';}
export function drawPlayerCard(ctx, f, x, y, w) {
  const c=hue(f), pct=Math.round(f.damage);
  ctx.save();
  ctx.fillStyle='rgba(3,4,8,.86)'; ctx.strokeStyle=f.human?'#69ffff':c; ctx.lineWidth=f.human?2.5:1.8;
  round(ctx,x,y,w,54,12); ctx.fill(); ctx.stroke();
  ctx.font='950 12px system-ui'; ctx.fillStyle=f.human?'#69ffff':c; ctx.fillText(f.human?'YOU':f.name.replace('Bot ','B'),x+8,y+16);
  ctx.font='950 28px system-ui'; ctx.fillStyle=pct>=120?'#ff6f5c':pct>=70?'#ffe36e':'#ffffff'; ctx.strokeStyle='#000'; ctx.lineWidth=4;
  const text=f.dead?'OUT':pct+'%'; ctx.strokeText(text,x+8,y+43); ctx.fillText(text,x+8,y+43);
  drawStockDots(ctx,f,x+w-35,y+42,c); ctx.restore();
}
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
