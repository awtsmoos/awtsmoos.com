// B"H
/** VendorRuntime: stock, living prices, buy/sell/buyback, and legacy UI payloads. */
import { calculateItemPrice, pricedVendorStock } from "../economy/EconomyPricingRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { applyVendorPurchase } from "../economy/EconomyTransactionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const DEFAULT_STOCK = Object.freeze([
  { id:"healing_herb", name:"Healing Herb", icon:"HERB", price:4 },
  { id:"travel_bread", name:"Travel Bread", icon:"BREAD", price:3 },
  { id:"repair_kit", name:"Repair Kit", icon:"TOOLS", price:8 },
  { id:"simple_cloak", name:"Simple Cloak", icon:"COAT", price:12 },
  { id:"small_siddur", name:"Small Siddur", icon:"BOOK", price:8 },
  { id:"work_jacket", name:"Work Jacket", icon:"COAT", price:15 }
]);

function economyFrom(ctx = {}) {
  return ctx.economy || ctx.store?.economy || ctx.livingWorld?.economy || null;
}

function event(name, detail) {
  globalThis.dispatchEvent?.(new CustomEvent(name, { detail }));
  return detail;
}

export function createVendorRuntime(stock = DEFAULT_STOCK, ctx = {}) {
  let buyback = [];
  const context = { ...ctx };
  return {
    list(nextCtx = {}) {
      const merged = { ...context, ...nextCtx };
      const economy = economyFrom(merged);
      return economy ? pricedVendorStock(stock, economy, { reputation:merged.reputation ?? 0 }) : stock.map(item => ({ ...item }));
    },
    price(item, reputation = 0, nextCtx = {}) {
      const economy = economyFrom({ ...context, ...nextCtx });
      if (economy) return calculateItemPrice(economy, item, { reputation });
      return Math.max(1, Math.round((item.price || 1) * (1 - Math.min(0.25, reputation / 1000))));
    },
    buy(id, nextCtx = {}) {
      const item = stock.find(x => x.id === id);
      if (!item) return { ok:false, error:"missing" };
      const merged = { ...context, ...nextCtx };
      const reputation = merged.reputation ?? 0;
      const price = this.price(item, reputation, merged);
      const listed = this.list(merged).find(x => x.id === id) || item;
      const transaction = applyVendorPurchase(listed, { ...merged, price, vendorId:merged.vendorId || "vendor" });
      if (!transaction.ok) return transaction;
      const payload = { item:{ ...item }, price, economyKey:listed.economyKey || id, transaction:transaction.transaction || null, remaining:transaction.remaining };
      event("mitzvah-world:vendor-buy", payload);
      return { ok:true, ...payload };
    },
    sell(item) {
      buyback.unshift({ ...item, soldAt:Date.now() });
      buyback = buyback.slice(0, 12);
      return { ok:true, buyback };
    },
    buyback() { return buyback.slice(); }
  };
}

export function openVendor(olamOrVendorId = {}, vendorIdOrStock = "toolmaker", stockOrCtx = DEFAULT_STOCK, ctx = {}) {
  const legacyOlam = typeof olamOrVendorId === "object" && (olamOrVendorId.ayshPeula || olamOrVendorId.player || olamOrVendorId.chossid);
  const olam = legacyOlam ? olamOrVendorId : null;
  const vendorId = legacyOlam ? vendorIdOrStock : olamOrVendorId;
  const stock = Array.isArray(vendorIdOrStock) ? vendorIdOrStock : Array.isArray(stockOrCtx) ? stockOrCtx : DEFAULT_STOCK;
  const context = legacyOlam ? { ...ctx, store:olam } : (Array.isArray(stockOrCtx) ? ctx : stockOrCtx || {});
  const runtime = createVendorRuntime(stock, { ...context, vendorId });
  const items = runtime.list(context);
  const payload = { open:true, vendorId, items, stock:items, repair:true, ctx:context };
  olam?.ayshPeula?.("ui event", "vendorScreen", payload);
  event("mitzvah-world:vendor-open", payload);
  return payload;
}

export default createVendorRuntime;
