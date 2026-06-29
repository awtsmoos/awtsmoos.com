// B"H
/** EconomyPricingRuntime: pricing policy over the EconomyQueryAdapter vocabulary. */
import { economyKeyForItem, basePriceForItem, demandFor, allEconomyKeys } from './EconomyQueryAdapter.js';
const clamp = (n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
export { economyKeyForItem };
export function calculateItemPrice(economy={}, item='bread', options={}){
  const key=economyKeyForItem(item), base=basePriceForItem(item,key);
  const supply=Number(economy[key] ?? 0), demand=demandFor(economy,key);
  const scarcity=clamp((demand - supply) / Math.max(1,demand), -0.6, 1);
  const multiplier=clamp(1 + scarcity * 0.75, 0.65, 1.9);
  const reputation=Number(options.reputation || 0);
  const discount=clamp(reputation / 1000, 0, 0.25);
  return Math.max(1, Math.round(base * multiplier * (1 - discount)));
}
export function calculateEconomyPrices(economy={}, options={}){ const prices={}; for(const key of allEconomyKeys(economy)) prices[key]=calculateItemPrice(economy,key,options); return prices; }
export function applyEconomyPricing(store={}, options={}){ store.economy ||= {}; store.economy.prices = { ...(store.economy.prices||{}), ...calculateEconomyPrices(store.economy, options) }; store.economy.lastPricedAt = Date.now(); store.economy.lastPricingReason = String(options.reason || 'economy-pricing'); return store.economy.prices; }
export function pricedVendorStock(stock=[], economy={}, options={}){ return (stock||[]).map(item=>({ ...item, economyKey:economyKeyForItem(item), basePrice:basePriceForItem(item), price:calculateItemPrice(economy,item,options) })); }
export function createEconomyPricingRuntime(store={}){ return { prices:(options={})=>applyEconomyPricing(store,options), itemPrice:(item,options={})=>calculateItemPrice(store.economy||{},item,options), stock:(stock,options={})=>pricedVendorStock(stock,store.economy||{},options), summary(){ return { prices:store.economy?.prices||{}, demand:store.economy?.demand||{}, lastPricedAt:store.economy?.lastPricedAt||0 }; } }; }
export default { economyKeyForItem, calculateItemPrice, calculateEconomyPrices, applyEconomyPricing, pricedVendorStock, createEconomyPricingRuntime };
