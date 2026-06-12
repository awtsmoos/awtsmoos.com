/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function panicRecovery(p,f,m,body,intent){const k=intent.panic||0;if(k<.4)return p;const s=body.height,osc=Math.sin((f.motionClock||0)*.33)*k;p.chest.x+=osc*3*s;p.head.x-=osc*4*s;return p}
