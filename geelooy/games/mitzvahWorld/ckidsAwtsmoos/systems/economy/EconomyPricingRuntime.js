// B"H
/**
 * @file EconomyPricingRuntime.js
 * @description
 * The market does not twitch every frame. It listens when bread is scarce,
 * candles are many, or trust has grown. Then the Awtsmoos lets one bounded
 * number descend into the stall so children can feel a living economy.
 */
const BASE = Object.freeze({ bread:5, warm_bread:5, challah:6, flour:3, candle:4, soup:3, paper:2, ink:2, work_jacket:15, small_siddur:8, charity:1 });
const ITEM_KEY = Object.freeze({ warm_bread:'bread', challah:'bread', bread:'bread', flour:'flour', candle:'candle', soup:'soup', small_siddur:'paper', work_jacket:'charity' });
const clamp = (n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
export function economyKeyForItem(item){ const id=typeof item==='string'?item:item?.economyKey||item?.id; return ITEM_KEY[id] || id || 'bread'; }
function basePriceFor(item,key){ if(typeof item==='object' && Number.isFinite(Number(item.basePrice ?? item.price))) return Number(item.basePrice ?? item.price); const id=typeof item==='string'?item:item?.id; return Number(BASE[id] || BASE[key] || 1); }
export function calculateItemPrice(economy={}, item='bread', options={}){
  const key=economyKeyForItem(item), base=basePriceFor(item,key);
  const supply=Number(economy[key] ?? 0), demand=Number(economy.demand?.[key] ?? 1);
  const scarcity=clamp((demand - supply) / Math.max(1,demand), -0.6, 1);
  const multiplier=clamp(1 + scarcity * 0.75, 0.65, 1.9);
  const reputation=Number(options.reputation || 0);
  const discount=clamp(reputation / 1000, 0, 0.25);
  return Math.max(1, Math.round(base * multiplier * (1 - discount)));
}
export function calculateEconomyPrices(economy={}, options={}){
  const keys=new Set([...Object.keys(BASE), ...Object.keys(economy.demand||{}), ...Object.keys(economy||{}).filter(k=>typeof economy[k]==='number')]);
  const prices={};
  for(const key of keys) prices[key]=calculateItemPrice(economy,key,options);
  return prices;
}
export function applyEconomyPricing(store={}, options={}){
  store.economy ||= {};
  store.economy.prices = { ...(store.economy.prices||{}), ...calculateEconomyPrices(store.economy, options) };
  store.economy.lastPricedAt = Date.now();
  store.economy.lastPricingReason = options.reason || 'economy-pricing';
  return store.economy.prices;
}
export function pricedVendorStock(stock=[], economy={}, options={}){
  return (stock||[]).map(item=>({ ...item, economyKey:economyKeyForItem(item), basePrice:Number(item.price||BASE[item.id]||1), price:calculateItemPrice(economy,item,options) }));
}
export function createEconomyPricingRuntime(store={}){ return { prices:(options={})=>applyEconomyPricing(store,options), itemPrice:(item,options={})=>calculateItemPrice(store.economy||{},item,options), stock:(stock,options={})=>pricedVendorStock(stock,store.economy||{},options), summary(){ return { prices:store.economy?.prices||{}, demand:store.economy?.demand||{}, lastPricedAt:store.economy?.lastPricedAt||0 }; } }; }
export default { economyKeyForItem, calculateItemPrice, calculateEconomyPrices, applyEconomyPricing, pricedVendorStock, createEconomyPricingRuntime };
