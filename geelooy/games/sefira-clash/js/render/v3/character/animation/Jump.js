/** B"H — jump gateway: ground, double, apex, fall, dive. */
import { groundJump } from './jump/GroundJump.js';
import { doubleJump } from './jump/DoubleJump.js';
import { apexHang } from './jump/ApexHang.js';
import { fallPanic } from './jump/FallPanic.js';
import { divePose } from './jump/DivePose.js';
export function jump(p,f,info={}){
 if(info.name==='doubleJump') return doubleJump(p,f);
 if(info.name==='peak') return apexHang(p,f);
 if(info.name==='falling'||info.name==='fastFall') return fallPanic(p,f,info.name==='fastFall');
 if(info.name==='dive'||f.diveAttackFrames>0||f.diving>0) return divePose(p,f);
 return groundJump(p,f);
}
