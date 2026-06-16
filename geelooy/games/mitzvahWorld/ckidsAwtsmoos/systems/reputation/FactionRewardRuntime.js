// B"H
/** @file FactionRewardRuntime.js @description Reputation reward lookups for vendor discounts, recipes, mounts, and cosmetics. */
import FactionRegistry, { factionById } from "./FactionRegistry.js";
export function rewardsForStanding(factionId, standing = "stranger") { const f = factionById(factionId); if (!f) return []; const order = { stranger:0, friendly:1, honored:2, revered:3, beloved:4 }; const level = order[standing] || 0; return (f.rewards || []).map((id, index) => ({ id, unlocked:index < level })); }
export function factionRewardPayload(player = {}) { return FactionRegistry.map(f => ({ faction:f, standing:player.reputation?.[f.id]?.standing || "stranger", rewards:rewardsForStanding(f.id, player.reputation?.[f.id]?.standing || "stranger") })); }
export default { rewardsForStanding, factionRewardPayload };
