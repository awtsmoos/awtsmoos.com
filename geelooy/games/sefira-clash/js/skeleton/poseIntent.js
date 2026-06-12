/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {clamp} from './poseMath.js';
export function poseIntent(f,anim,m={}){const damage=f.damage||0,last=(f.stocks||0)<=1,role=f.aiMind?.role?.name||'',panic=clamp((damage-115)/90+(last?.25:0)),hunt=role==='Hunter'||f.aiMind?.koIntent?.active?1:0,recover=!f.grounded&&(anim.kind==='fall'||anim.kind==='fastFall')&&f.y>0?.65:0,charge=clamp(f.chargeGlow||0),face=m.facing||f.face||1,vx=f.vx||0,airTurn=!f.grounded&&Math.sign(vx||face)!==Math.sign(face)?1:0,dive=f.fastFalling||f.attack?.id==='meteorKick'?1:0,confidence=clamp((f.combo?.count||0)/5+charge*.5-panic*.35+(f.human?.08:0));return{mood:chooseMood(anim,{panic,hunt,recover,charge,dive}),panic,hunt,recover,charge,airTurn,dive,confidence,damageCurl:clamp((damage-70)/130),lean:clamp(vx*.032+hunt*face*.16-panic*face*.08,-.55,.55),footWiden:1+panic*.55+clamp(damage/220,0,.4)}}
function chooseMood(anim,v){if(v.dive)return'dive';if(v.charge>.1)return'charge';if(anim.kind?.startsWith('attack:'))return'attack';if(v.panic>.65)return'panic';if(v.recover>.5)return'recover';if(v.hunt)return'hunt';return anim.kind}
