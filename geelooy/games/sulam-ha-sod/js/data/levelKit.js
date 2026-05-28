// B"H
/**
 * Small level-construction kit for Sulam HaSod.
 * Each chamber imports these pure builders so level files stay readable,
 * hand-authored, and data-driven instead of becoming one giant scroll.
 */
export const P=(x,y,w,h)=>({x,y,w,h});
export const C=(x,y,kind='perutah')=>({x,y,kind});
export const S=(x,y,w=80,h=28,delay=1,min=1,max=3)=>({x,y,w,h,delay,min,max});
export const E=(x,y,min,max,vx,type='husk',name='husk')=>({x,y,w:36,h:34,min,max,vx,type,name});
export const R=(x,y,w=76,h=16,spin=2,throwPower=360)=>({x,y,w,h,spin,throw:throwPower});
export const T=(x,y,w=70,h=18,kind='shatter',extra={})=>({x,y,w,h,kind,...extra});
export const G=(x,y,w,h,message,extra={})=>({x,y,w,h,message,...extra});
export const L=(name,width,spawn,door,law,platforms,rotatingPlatforms,trickPlatforms,coins,keys,spikes,enemies,triggers)=>({
  name,width,spawn,door,law,platforms,rotatingPlatforms,trickPlatforms,coins,keys,spikes,enemies,triggers
});
