// B"H
/**
 * EconomyQueryAdapter
 * One small vocabulary for item -> economy key -> base price -> stock math.
 * This is an abstraction seam, not a new economy feature.
 */
export const BASE_ECONOMY_PRICES = Object.freeze({ bread:5, warm_bread:5, challah:6, flour:3, candle:4, soup:3, paper:2, ink:2, work_jacket:15, small_siddur:8, charity:1, water:1, water_cup:1, milk:3, honey:4, tea:3, warm_tea:3 });
export const ITEM_ECONOMY_KEYS = Object.freeze({ warm_bread:'bread', challah:'bread', bread:'bread', flour:'flour', candle:'candle', soup:'soup', small_siddur:'paper', work_jacket:'charity', water_cup:'water', warm_tea:'tea', tea:'tea', milk:'milk', honey:'honey' });
export function economyKeyForItem(item){ const id=typeof item==='string'?item:item?.economyKey||item?.id; return ITEM_ECONOMY_KEYS[id] || id || 'bread'; }
export function basePriceForItem(item, key = economyKeyForItem(item)) { if (typeof item === 'object' && Number.isFinite(Number(item.basePrice ?? item.price))) return Number(item.basePrice ?? item.price); const id = typeof item === 'string' ? item : item?.id; return Number(BASE_ECONOMY_PRICES[id] || BASE_ECONOMY_PRICES[key] || 1); }
export function availableStock(economy = {}, key = 'bread') { return Number(economy?.[key] || 0); }
export function hasStock(economy = {}, key = 'bread', qty = 1) { return availableStock(economy, key) >= Math.max(1, Number(qty || 1)); }
export function changeStock(economy = {}, key = 'bread', delta = 0) { economy[key] = Math.max(0, Number(economy[key] || 0) + Number(delta || 0)); return economy[key]; }
export function demandFor(economy = {}, key = 'bread') { return Number(economy?.demand?.[key] ?? 1); }
export function allEconomyKeys(economy = {}) { return new Set([...Object.keys(BASE_ECONOMY_PRICES), ...Object.keys(economy.demand || {}), ...Object.keys(economy || {}).filter(k => typeof economy[k] === 'number' && !k.endsWith('At'))]); }
export default { BASE_ECONOMY_PRICES, ITEM_ECONOMY_KEYS, economyKeyForItem, basePriceForItem, availableStock, hasStock, changeStock, demandFor, allEconomyKeys };
