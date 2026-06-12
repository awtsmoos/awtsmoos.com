/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
export const vec=(x=0,y=0)=>({x:Number.isFinite(x)?x:0,y:Number.isFinite(y)?y:0});
export const add=(a,b)=>vec((a?.x||0)+(b?.x||0),(a?.y||0)+(b?.y||0));
export const sub=(a,b)=>vec((a?.x||0)-(b?.x||0),(a?.y||0)-(b?.y||0));
export const mul=(v,n)=>vec((v?.x||0)*n,(v?.y||0)*n);
export const len=v=>Math.hypot(v?.x||0,v?.y||0);
export const norm=(v,f={x:1,y:0})=>{const l=len(v);return l?vec(v.x/l,v.y/l):vec(f.x,f.y)};
export const perp=v=>vec(-(v?.y||0),v?.x||0);
export const angleOf=v=>Math.atan2(v?.y||0,v?.x||0);
