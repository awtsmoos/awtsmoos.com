// B"H
/** @file PerutaPricingRuntime.js @description Prices respect rarity, condition, supply, demand, merchant type, and player trade. */
const RARITY={ common:1, uncommon:1.35, rare:2, epic:3.5, holy:5 };
function tradeFactor(stats={}){ return Math.max(.65, 1 - Math.min(35, stats.trade || 0) / 100); }
function marketFactor(merchant={}){ const supply=merchant.supply ?? 1, demand=merchant.demand ?? 1, region=merchant.regionMultiplier ?? 1; return Math.max(.25, demand * region / Math.max(.25, supply)); }
export function buyPrice(item={},merchant={},playerStats={}){ const base=item.buy??10, rarity=RARITY[item.rarity]||1, markup=merchant.markup??1, condition=item.condition??1; return Math.max(1,Math.round(base*rarity*markup*condition*marketFactor(merchant)*tradeFactor(playerStats))); }
export function sellPrice(item={},merchant={},playerStats={}){ const base=item.sell??Math.round((item.buy??10)*.5), rate=merchant.sellRate??1, condition=item.condition??1, charisma=1+Math.min(25,playerStats.charisma||0)/100; return Math.max(1,Math.round(base*rate*condition*charisma)); }
export function repairPrice(item={},merchant={}){ return Math.max(1,Math.round((item.repair??(item.buy??10)*.18)*(merchant.markup??1)*(1-(item.condition??1)))); }
export default { buyPrice, sellPrice, repairPrice };
