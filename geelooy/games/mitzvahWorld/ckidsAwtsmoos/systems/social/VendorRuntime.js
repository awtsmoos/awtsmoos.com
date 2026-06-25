// B"H
/**
 * VendorRuntime
 * Stock, price, reputation discount, buy/sell/buyback. With a living economy,
 * a purchase lowers supply, creates a village event, and reprices the table.
 * Without that context, legacy fixed-price buying still works.
 */
import { calculateItemPrice, pricedVendorStock } from '../economy/EconomyPricingRuntime.js';
import { applyVendorPurchase } from '../economy/EconomyTransactionRuntime.js';
const DEFAULT_STOCK = Object.freeze([{id:'warm_bread',name:'Warm Bread',price:3},{id:'small_siddur',name:'Small Siddur',price:8},{id:'work_jacket',name:'Work Jacket',price:15}]);
function economyFrom(ctx={}){ return ctx.economy || ctx.store?.economy || ctx.livingWorld?.economy || null; }
function event(name, detail){ globalThis.dispatchEvent?.(new CustomEvent(name,{detail})); return detail; }
export function createVendorRuntime(stock=DEFAULT_STOCK, ctx={}){ let buyback=[]; const context={...ctx}; return {
  list(nextCtx={}){ const merged={...context,...nextCtx}; const economy=economyFrom(merged); return economy ? pricedVendorStock(stock,economy,{reputation:merged.reputation ?? 0}) : stock.map(item=>({...item})); },
  price(item,reputation=0,nextCtx={}){ const economy=economyFrom({...context,...nextCtx}); if(economy) return calculateItemPrice(economy,item,{reputation}); return Math.max(1,Math.round((item.price||1)*(1-Math.min(.25,reputation/1000)))); },
  buy(id,nextCtx={}){ const item=stock.find(x=>x.id===id); if(!item)return{ok:false,error:'missing'}; const merged={...context,...nextCtx}; const reputation=merged.reputation ?? 0; const price=this.price(item,reputation,merged); const listed=this.list(merged).find(x=>x.id===id) || item; const transaction=applyVendorPurchase(listed,{...merged,price,vendorId:merged.vendorId||'vendor'}); if(!transaction.ok) return transaction; const payload={item:{...item},price,economyKey:listed.economyKey||id,transaction:transaction.transaction||null,remaining:transaction.remaining}; event('mitzvah-world:vendor-buy',payload); return{ok:true,...payload}; },
  sell(item){buyback.unshift({...item,soldAt:Date.now()}); buyback=buyback.slice(0,12); return{ok:true,buyback};},
  buyback(){return buyback.slice();}
}; }
export function openVendor(vendorId='food_table', stock=DEFAULT_STOCK, ctx={}){ const runtime=createVendorRuntime(stock,{...ctx,vendorId}); const payload={vendorId,stock:runtime.list(ctx),ctx}; event('mitzvah-world:vendor-open',payload); return payload; }
export default createVendorRuntime;
