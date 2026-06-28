// B"H
import { SLEEP_TIERS, sleepTierForDistance, cadenceForTier, shouldWake } from '../../ckidsAwtsmoos/systems/core/WorldSleepPolicy.js';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
assert(sleepTierForDistance(10)===SLEEP_TIERS.ACTIVE,'near should active');
assert(sleepTierForDistance(1000)===SLEEP_TIERS.UNLOADED,'far should unloaded');
assert(cadenceForTier(SLEEP_TIERS.SLEEPING)>cadenceForTier(SLEEP_TIERS.ACTIVE),'sleeping cadence slower');
assert(shouldWake(SLEEP_TIERS.ACTIVE,1) && !shouldWake(SLEEP_TIERS.UNLOADED,1),'wake policy works');
console.log(JSON.stringify({ok:true, tiers:SLEEP_TIERS},null,2));
