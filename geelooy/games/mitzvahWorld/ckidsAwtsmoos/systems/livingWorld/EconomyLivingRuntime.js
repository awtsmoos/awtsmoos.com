// B"H
/**
 * EconomyLivingRuntime
 * Economy signals must not secretly load/save the whole living world during a
 * budgeted village pulse. Direct helper calls can still persist through the old
 * compatibility path, but schedulers use `applyEconomySignalToStore` to mutate
 * the active store only.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket, addEventFeed } from './LivingWorldState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function cap(list = [], n = 40) { return (list || []).slice(-n); }
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'economy', id, action, detail });
  return rememberLivingWorld('economy', id, { action, detail });
}
export function applyEconomySignalToStore(store = globalThis.__MITZVAH_WORLD_STATE__ || {}, id = 'economy', detail = {}) {
  store.economySignals ||= [];
  const row = { domain:'economy', id, action:detail.action || 'signal', detail, at:Date.now() };
  store.economySignals = cap([...store.economySignals, row], 40);
  addEventFeed(store, row);
  return row;
}
export function applyEconomySignal(id = 'economy', detail = {}, store = null) { return store ? applyEconomySignalToStore(store, id, detail) : write(id, detail.action || 'signal', detail); }
export function economySnapshot(state = {}) { return state.economy || livingWorldBucket('economy'); }
export function stepEconomyLivingWorld(reason = 'scheduled', budget = {}) { const snapshot = economySnapshot(); const keys = Object.keys(snapshot); return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length }); }
export function inflation(id = 'inflation', detail = {}) { return write(id, 'inflation', detail); }
export function shortages(id = 'shortages', detail = {}) { return write(id, 'shortages', detail); }
export function merchantCompetition(id = 'merchant_competition', detail = {}) { return write(id, 'merchant_competition', detail); }
export function regionalSpecialties(id = 'regional_specialties', detail = {}) { return write(id, 'regional_specialties', detail); }
export function monopolies(id = 'monopolies', detail = {}) { return write(id, 'monopolies', detail); }
export function laborMarkets(id = 'labor_markets', detail = {}) { return write(id, 'labor_markets', detail); }
export function bottlenecks(id = 'bottlenecks', detail = {}) { return write(id, 'bottlenecks', detail); }
export function transportCosts(id = 'transport_costs', detail = {}) { return write(id, 'transport_costs', detail); }
export function seasonalPrices(id = 'seasonal_prices', detail = {}) { return write(id, 'seasonal_prices', detail); }
export function craftReputation(id = 'craft_reputation', detail = {}) { return write(id, 'craft_reputation', detail); }
export function creditTabs(id = 'credit_tabs', detail = {}) { return write(id, 'credit_tabs', detail); }
export function debtForgiveness(id = 'debt_forgiveness', detail = {}) { return write(id, 'debt_forgiveness', detail); }
export default { applyEconomySignal, applyEconomySignalToStore, economySnapshot, stepEconomyLivingWorld, inflation, shortages, merchantCompetition, regionalSpecialties, monopolies, laborMarkets, bottlenecks, transportCosts, seasonalPrices, craftReputation, creditTabs, debtForgiveness };
