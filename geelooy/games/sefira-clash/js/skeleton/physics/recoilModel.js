/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {clamp} from '../poseMath.js';
export function recoilModel(f,metrics){const active=f.attackFrame||0,rec=f.attack?.recovery||0;return{attackRecoil:f.attack?clamp((active-(f.attack.startup||1)-(f.attack.active||1))/(rec||1),0,1):0,hitRecoil:f.stun?clamp(f.stun/25):0,landingRecoil:metrics.landingImpact||0}}
