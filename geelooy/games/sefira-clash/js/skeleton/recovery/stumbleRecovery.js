/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function stumbleRecovery(p,f,m,body){const k=(f.visualStyle?.damage?.stumble||0);if(k<=0||!m.grounded)return p;const s=body.height;p.hip.x+=Math.sin((f.motionClock||0)*.21)*8*k*s;p.head.x-=Math.sin((f.motionClock||0)*.21)*6*k*s;return p}
