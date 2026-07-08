// B"H
import { calculateItemPrice, economyKeyForItem, pricedVendorStock } from "../../systems/economy/EconomyPricingRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const list = value => Array.isArray(value) ? value : value == null ? [] : [value];

export function buildEconomyState(world = {}) {
  const economy = { demand:{}, prices:{} };
  for (const animal of list(world.animals)) {
    const key = `${animal.species || "animal"}_goods`;
    economy[key] = (economy[key] || 0) + Math.max(1, Math.round((animal.loot?.length || 1) * .5));
    economy.demand[key] = Math.max(2, economy.demand[key] || 2);
  }
  for (const shop of list(world.shops)) {
    const key = String(shop.stock || shop.id || "starter").replace(/_stock$/, "");
    economy[key] = economy[key] ?? 3;
    economy.demand[key] = Math.max(economy.demand[key] || 0, shop.demand || 5);
  }
  economy.coin = Number(world.population || 60) * 4;
  return economy;
}

export function runLivingEconomy(world = {}, playerActions = []) {
  const economy = buildEconomyState(world);
  for (const action of list(playerActions)) {
    const key = economyKeyForItem(action.item || action.resource || action.target || "bread");
    if (action.type === "buy") economy[key] = Math.max(0, Number(economy[key] || 0) - Number(action.count || 1));
    if (action.type === "sell" || action.type === "harvest") economy[key] = Number(economy[key] || 0) + Number(action.count || 1);
    if (action.type === "quest_complete") economy.demand[key] = Math.max(1, Number(economy.demand[key] || 1) - 1);
  }
  const shops = list(world.shops).map(shop => {
    const stock = list(shop.items || [{ id:shop.stock || "travel_bread", name:shop.stock || "Travel Bread", price:5 }]);
    return { ...shop, stock:pricedVendorStock(stock, economy) };
  });
  for (const shop of shops) for (const item of shop.stock) economy.prices[item.economyKey] = calculateItemPrice(economy, item);
  return { economy, shops, events:playerActions.map(action => ({ type:"economy_action", action })) };
}

export default { buildEconomyState, runLivingEconomy };
