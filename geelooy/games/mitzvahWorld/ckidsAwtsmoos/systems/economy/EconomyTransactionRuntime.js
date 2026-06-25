// B"H
/** EconomyTransactionRuntime: vendor purchase checks wallet, stock, supply, then records a bounded living transaction. */
import { applyEconomyPricing, economyKeyForItem } from './EconomyPricingRuntime.js';
const LIMIT = 50;
const cap = (xs,n=LIMIT)=>(xs||[]).slice(-n);
function storeFrom(ctx={}){ return ctx.store || ctx.livingWorld || null; }
function economyFrom(ctx={}){ return ctx.economy || storeFrom(ctx)?.economy || null; }
function playerFrom(ctx={}){ return ctx.player || ctx.olam?.player || ctx.store?.player || null; }
function wallet(player){ return Number(player?.perutah ?? player?.coins ?? Infinity); }
function charge(player,cost){ if(!player || !Number.isFinite(wallet(player))) return true; if(wallet(player)<cost) return false; if(player.perutah!==undefined) player.perutah-=cost; else player.coins-=cost; return true; }
function addFeed(store,row){ if(!store) return; const event={ type:'vendor-purchase', ...row, at:row.at||Date.now() }; store.eventFeed=cap([...(store.eventFeed||[]),event],80); store.ambientEvents=cap([...(store.ambientEvents||[]),event],80); }
export function applyVendorPurchase(item={}, ctx={}){
  const store=storeFrom(ctx), economy=economyFrom(ctx), player=playerFrom(ctx), key=economyKeyForItem(item), qty=Math.max(1,Number(ctx.qty||1)), price=Number(ctx.price||0)*qty;
  if(player && wallet(player)<price) return { ok:false, error:'low_perutah', price, perutah:wallet(player), economyKey:key, qty };
  if(!economy){ if(!charge(player,price)) return { ok:false, error:'low_perutah', price, perutah:wallet(player), economyKey:key, qty }; return { ok:true, legacy:true, economyKey:key, qty, price, perutah:wallet(player) }; }
  if(Number(economy[key]||0) < qty) return { ok:false, error:'out_of_stock', economyKey:key, available:Number(economy[key]||0), qty };
  if(!charge(player,price)) return { ok:false, error:'low_perutah', price, perutah:wallet(player), economyKey:key, qty };
  economy[key]=Number(economy[key]||0)-qty;
  const row={ id:`vendor_${Date.now()}_${key}`, itemId:item.id||key, economyKey:key, qty, price, vendorId:ctx.vendorId||'vendor', at:Date.now() };
  if(store){ store.economyTransactions=cap([...(store.economyTransactions||[]),row]); addFeed(store,row); applyEconomyPricing(store,{reason:`vendor-buy:${key}`}); }
  else applyEconomyPricing({ economy },{reason:`vendor-buy:${key}`});
  return { ok:true, transaction:row, economyKey:key, remaining:Number(economy[key]||0), prices:economy.prices||{}, price, perutah:wallet(player) };
}
export function createEconomyTransactionRuntime(store={}){ return { buy:(item,ctx={})=>applyVendorPurchase(item,{...ctx,store}), transactions:()=>cap(store.economyTransactions||[]), summary:()=>({ transactions:(store.economyTransactions||[]).length, economy:store.economy||{} }) }; }
export default { applyVendorPurchase, createEconomyTransactionRuntime };
