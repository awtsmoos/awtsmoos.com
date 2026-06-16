/** B"H — punch gateway: jab, rapid, charged, recovery. */
import { attackPhase, clamp } from './Math.js';
import { jabPose } from './punch/JabPose.js';
import { rapidPose } from './punch/RapidPose.js';
import { chargedPose } from './punch/ChargedPose.js';
import { missRecovery } from './punch/MissRecovery.js';
export function punch(p,f,info={}){
 const ph=info.phase||attackPhase(f),a=ph.a||{},face=p.face;
 if(a.rapid||f.rapidAttack) return rapidPose(p,f,ph);
 const side=face>0?'right':'left',other=side==='right'?'left':'right',sign=side==='right'?1:-1;
 const charge=clamp((a.charge||0)+(a.fullCharge?1:0));
 const heavy=charge+(a.id||'').includes('dash')*.4+info.combo*.5;
 const wind=ph.name==='anticipation'?1-ph.t:0,hit=ph.name==='action'?ph.t:0,rec=ph.name==='followThrough'?ph.t:0;
 const reach=60+heavy*34;
 p=(heavy>.35||info.name?.includes('charge'))?chargedPose(p,face,side,other,sign,wind,hit,rec,reach,heavy):jabPose(p,face,side,other,sign,wind,hit,rec,reach);
 return rec>.2?missRecovery(p,f,rec):p;
}
