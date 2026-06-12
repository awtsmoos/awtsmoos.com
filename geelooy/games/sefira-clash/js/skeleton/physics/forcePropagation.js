/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {clamp} from '../poseMath.js';
export function forcePropagation(f,metrics,intent){const hit=f.stun>0?clamp((f.stun||0)/30):0,attack=f.attack?1:0,land=metrics.landingImpact||0,run=clamp(metrics.horizontalSpeed/12);return{footToHip:run*.35+land*.8,hipToChest:run*.28+attack*.4+land*.6,chestToHead:attack*.28+hit*.65+land*.35,shoulderWhip:attack*.9+intent.charge*.35,damageWave:hit+intent.damageCurl*.35}}
