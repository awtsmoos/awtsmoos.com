/** B"H — knockback reveals accumulated damage as sudden distance. */
export function applyKnockback(target, source, attack, weapon){ const mult=1+target.damage*.018; const k=(attack.knock+(weapon?.knock||0))*mult/target.stats.mass; target.vx=Math.sign(target.x-source.x||source.face)*k; target.vy=-k*.62; target.stun=Math.min(55,12+target.damage*.12); }
