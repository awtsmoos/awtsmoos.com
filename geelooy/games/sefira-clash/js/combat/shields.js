/** B"H — shield is chesed as circumference, mercy as a circle. */
export function updateShield(f,input){ f.blocking=!!input.shield&&f.shield>0&&!f.attack; if(f.blocking)f.shield=Math.max(0,f.shield-.42); else f.shield=Math.min(f.stats.shield,f.shield+.18); }
export function shieldAbsorb(f,amount){ f.shield=Math.max(0,f.shield-amount*3); if(f.shield<=0){f.stun=55;f.blocking=false;} }
