/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
import {lerp} from './scalar.js';
export const point=(x,y)=>({x:Number.isFinite(x)?x:0,y:Number.isFinite(y)?y:0});
export const movePoint=(p,dx=0,dy=0)=>(p.x+=dx,p.y+=dy,p);
export const lerpPoint=(a,b,t)=>point(lerp(a.x,b.x,t),lerp(a.y,b.y,t));
export const offsetAlong=(p,d,dist)=>point(p.x+(d?.x||0)*dist,p.y+(d?.y||0)*dist);
