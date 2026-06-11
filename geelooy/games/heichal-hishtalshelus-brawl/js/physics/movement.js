/** B"H — movement gives the spark legs, jump, dash, and aerial return. */
export function applyMovement(f,input){ if(f.stun>0)return; const accel=f.grounded?f.stats.accel:f.stats.air; f.vx += (input.x||0)*accel; if(input.x)f.face=input.x<0?-1:1; if(input.jump&&f.grounded){f.vy=-f.stats.jump;f.grounded=false;} if(input.special&&!f.grounded&&f.stats.recovery){f.vy-=.18*f.stats.recovery;} }
