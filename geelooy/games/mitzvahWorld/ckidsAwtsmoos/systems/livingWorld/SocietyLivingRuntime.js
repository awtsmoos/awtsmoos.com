// B"H
/**
 * SocietyLivingRuntime
 * File-by-file implementation of society living-world behavior. Each action
 * records state deltas and can be stepped by the budgeted LivingWorldRuntime.
 */
import { rememberLivingWorld, recordLivingWorldEvent, livingWorldBucket } from './LivingWorldState.js';
function write(id, action, detail = {}) {
  recordLivingWorldEvent({ domain:'society', id, action, detail });
  return rememberLivingWorld('society', id, { action, detail });
}
export function applySocietySignal(id = 'society', detail = {}) { return write(id, detail.action || 'signal', detail); }
export function societySnapshot(state = {}) { return state['society'] || livingWorldBucket('society'); }
export function stepSocietyLivingWorld(reason = 'scheduled', budget = {}) {
  const snapshot = societySnapshot();
  const keys = Object.keys(snapshot);
  return write('domain_step', 'step', { reason, budgetLevel:budget.level || budget.realism?.level || 'unknown', known:keys.length });
}
export function longTermAmbitions(id = 'long_term_ambitions', detail = {}) { return write(id, 'long_term_ambitions', detail); }
export function friendships(id = 'friendships', detail = {}) { return write(id, 'friendships', detail); }
export function rivalries(id = 'rivalries', detail = {}) { return write(id, 'rivalries', detail); }
export function marriage(id = 'marriage', detail = {}) { return write(id, 'marriage', detail); }
export function births(id = 'births', detail = {}) { return write(id, 'births', detail); }
export function elderPassing(id = 'elder_passing', detail = {}) { return write(id, 'elder_passing', detail); }
export function leadershipSuccession(id = 'leadership_succession', detail = {}) { return write(id, 'leadership_succession', detail); }
export function communityVoting(id = 'community_voting', detail = {}) { return write(id, 'community_voting', detail); }
export function apprenticeMastery(id = 'apprentice_mastery', detail = {}) { return write(id, 'apprentice_mastery', detail); }
export function familyLineages(id = 'family_lineages', detail = {}) { return write(id, 'family_lineages', detail); }
export function hospitalityCircles(id = 'hospitality_circles', detail = {}) { return write(id, 'hospitality_circles', detail); }
export function neighborFavors(id = 'neighbor_favors', detail = {}) { return write(id, 'neighbor_favors', detail); }
export default { applySocietySignal, societySnapshot, stepSocietyLivingWorld, longTermAmbitions, friendships, rivalries, marriage, births, elderPassing, leadershipSuccession, communityVoting, apprenticeMastery, familyLineages, hospitalityCircles, neighborFavors };
