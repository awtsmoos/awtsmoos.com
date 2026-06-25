// B"H
/**
 * EconomyLivingRuntime
 * File-by-file implementation of economy living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'economy', id, action, detail });
  return rememberLivingWorld('economy', id, { action, detail });
}
export function applyEconomySignal(id = 'economy', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function economySnapshot(state = {}) { return state['economy'] || livingWorldBucket('economy'); }
export function stepEconomyLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = economySnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
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
export default { applyEconomySignal, economySnapshot, stepEconomyLivingWorld, inflation, shortages, merchantCompetition, regionalSpecialties, monopolies, laborMarkets, bottlenecks, transportCosts, seasonalPrices, craftReputation, creditTabs, debtForgiveness };
