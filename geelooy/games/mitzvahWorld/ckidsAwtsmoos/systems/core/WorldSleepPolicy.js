// B"H
/** WorldSleepPolicy: declarative sleep tiers for existing systems; no feature expansion. */
export const SLEEP_TIERS = Object.freeze({ ACTIVE:'active', NEARBY:'nearby', SLEEPING:'sleeping', UNLOADED:'unloaded' });
export function sleepTierForDistance(distance = 0) { const d=Number(distance)||0; if(d<80) return SLEEP_TIERS.ACTIVE; if(d<240) return SLEEP_TIERS.NEARBY; if(d<900) return SLEEP_TIERS.SLEEPING; return SLEEP_TIERS.UNLOADED; }
export function cadenceForTier(tier=SLEEP_TIERS.ACTIVE){ return { active:1, nearby:6, sleeping:60, unloaded:600 }[tier] || 60; }
export function shouldWake(tier, tick=0){ const cadence=cadenceForTier(tier); return cadence<=1 || tick % cadence === 0; }
export default { SLEEP_TIERS, sleepTierForDistance, cadenceForTier, shouldWake };
