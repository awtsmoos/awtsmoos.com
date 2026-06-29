// B"H
/** Existing economy/crafting/vendor surfaces should support simple realistic drinks. */
import { resetLivingWorldState, loadLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { craftItem } from '../../ckidsAwtsmoos/systems/professions/ProfessionRuntime.js';
import { applyEconomyPricing } from '../../ckidsAwtsmoos/systems/economy/EconomyPricingRuntime.js';
import { applyVendorPurchase } from '../../ckidsAwtsmoos/systems/economy/EconomyTransactionRuntime.js';
import { stockFor } from '../../ckidsAwtsmoos/systems/social/VendorStockRegistry.js';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const memory = new Map();
globalThis.localStorage = { getItem:k => memory.get(k) || null, setItem:(k,v) => memory.set(k,String(v)), removeItem:k => memory.delete(k) };
globalThis.CustomEvent ||= class CustomEvent { constructor(type, init={}){ this.type=type; this.detail=init.detail; } };
globalThis.dispatchEvent ||= () => true;
resetLivingWorldState({ economy:{ water:4, honey:2, milk:2, tea:0, demand:{ water:4, honey:2, milk:2, tea:3 }, prices:{} } });
const store = loadLivingWorldState();
const crafted = craftItem(store, 'tea', 'miriam_baker');
assert(crafted?.recipeId === 'tea', 'tea should craft through existing profession runtime');
applyEconomyPricing(store, { reason:'beverage-audit' });
assert(store.economy.prices.tea >= 1 && store.economy.prices.water >= 1, 'tea and water should be priced');
assert(stockFor('baker').includes('tea') && stockFor('vendor').includes('water_cup'), 'vendors should stock simple drinks');
const purchase = applyVendorPurchase({ id:'tea', price:store.economy.prices.tea }, { store, vendorId:'baker', qty:1 });
assert(purchase.ok, 'tea should be purchasable through existing vendor transaction');
assert(purchase.price > 0 && purchase.transaction.price > 0, 'vendor drink purchase should charge a nonzero price');
console.log(JSON.stringify({ ok:true, crafted, prices:{ tea:store.economy.prices.tea, water:store.economy.prices.water, milk:store.economy.prices.milk }, bakerStock:stockFor('baker'), vendorStock:stockFor('vendor'), purchase }, null, 2));
