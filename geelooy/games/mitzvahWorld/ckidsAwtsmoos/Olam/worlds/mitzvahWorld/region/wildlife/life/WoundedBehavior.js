// B"H
/** @file WoundedBehavior.js @description Healthy-alert-injured-desperate behavior tiers. */
import { dataOf, posOf, steerAway } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
export function woundTier(actor) { const h = dataOf(actor).health || {}; if (!h.max) return 'healthy'; const pct = h.current / h.max; if (pct <= 0) return 'dead'; if (pct < .12) return 'desperate'; if (pct < .32) return 'injured'; if (pct < .62) return 'alert'; return 'healthy'; }
export function woundedDecision(actor, perception) { const tier = woundTier(actor); dataOf(actor).woundTier = tier; if (tier === 'dead') return { state:'death' }; if (tier === 'desperate') { const t = perception.nearestThreat || perception.nearestPrey; return { state:'desperateFlee', target:t ? steerAway(posOf(actor), posOf(t.actor), 24) : null }; } if (tier === 'injured') return { state:'limp' }; return null; }
export function woundSummary(actors = []) { const tiers = {}; actors.forEach(a => { const t = woundTier(a); tiers[t] = (tiers[t] || 0) + 1; }); return { woundTiers:tiers }; }
