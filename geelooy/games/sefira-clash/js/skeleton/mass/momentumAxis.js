/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function momentumAxis(f,metrics){const vx=f.vx||0,vy=f.vy||0,l=Math.hypot(vx,vy)||1;return{x:vx/l,y:vy/l,speed:l,forward:Math.sign(vx||metrics.facing||1)}}
