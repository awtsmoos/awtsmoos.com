// B'H
export const TAU=Math.PI*2;
export function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
export function len(x,y){return Math.hypot(x,y)}
export function norm(v){const d=len(v.x,v.y)||1;return{x:v.x/d,y:v.y/d}}
export function dist(a,b){return len(a.x-b.x,a.y-b.y)}
export function mix(a,b,t){return a+(b-a)*clamp(t,0,1)}
export function rng(seed){let s=seed>>>0;return()=>((s=s*1664525+1013904223>>>0)/4294967296)}
export function heightAt(x,y,w=0){return Math.sin((x+w*70)*.004)*18+Math.cos((y-w*80)*.003)*14+Math.sin((x+y)*.002)*10}
export function hsl(h,s=82,l=62){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[f(0),f(8),f(4)]}
export function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),nf=1/(near-far);return[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]}
export function lookAt(e,c){const z=unit([e[0]-c[0],e[1]-c[1],e[2]-c[2]]),x=unit([z[2],0,-z[0]]);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]}
export function mul(a,b){const o=Array(16).fill(0);for(let r=0;r<4;r++)for(let c=0;c<4;c++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o}
function unit(v){const d=Math.hypot(...v)||1;return v.map(n=>n/d)}function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
