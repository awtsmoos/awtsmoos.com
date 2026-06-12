/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
export const lerp=(a,b,t)=>a+(b-a)*clamp(t);
export const smoothstep=(a,b,x)=>{const t=clamp((x-a)/((b-a)||1));return t*t*(3-2*t)};
export const approach=(v,t,a)=>v<t?Math.min(t,v+a):Math.max(t,v-a);
export const signOr=(v,f=1)=>v<0?-1:v>0?1:f;
export function springValue(value,target,velocity=0,stiffness=.18,damping=.72){const next=(velocity+(target-value)*stiffness)*damping;return{value:value+next,velocity:next}}
