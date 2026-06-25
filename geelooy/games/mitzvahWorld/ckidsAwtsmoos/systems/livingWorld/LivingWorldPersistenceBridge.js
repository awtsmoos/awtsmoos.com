// B"H
/**
 * @file LivingWorldPersistenceBridge.js
 * @description
 * A narrow bridge between the living village and the broader world-state ark.
 * The Awtsmoos lets memory remain one, yet each vessel keeps its task: the
 * living-world store remains owner, while world-state receives a bounded mirror
 * for reloads, handoffs, social repair, and future saves.
 */
import { loadWorldState, mutateWorldState } from '../worldState/WorldStateStore.js';

export const livingWorldPersistenceKeys = Object.freeze([
  'currentDay', 'currentSeason', 'clockHour', 'hearthLocation', 'npcMemories',
  'movementIntents', 'rumors', 'activeMissions', 'completedMissions',
  'familyTrust', 'socialConsequences', 'apologies', 'economyTransactions', 'reputation', 'economy',
  'craftedItems', 'servicesVisited', 'ambientEvents', 'villageProjects',
  'tutorialProgress', 'eventFeed'
]);
const LIMITS = Object.freeze({ movementIntents:24, rumors:40, completedMissions:40, socialConsequences:60, apologies:40, economyTransactions:50, craftedItems:40, servicesVisited:40, ambientEvents:80, eventFeed:80 });
const clone = value => JSON.parse(JSON.stringify(value ?? null));
const cap = (value, key) => Array.isArray(value) ? value.slice(-(LIMITS[key] || 80)) : value;
function pick(state = {}) {
  const slice = {};
  for (const key of livingWorldPersistenceKeys) if (state[key] !== undefined) slice[key] = cap(clone(state[key]), key);
  return slice;
}
export function extractLivingWorldPersistenceSlice(state = {}) {
  return { version:1, updatedAt:Date.now(), ...pick(state) };
}
export function mergeLivingWorldPersistenceSlice(state = {}, slice = {}) {
  const incoming = slice?.livingWorld || slice || {};
  const merged = { ...state };
  for (const key of livingWorldPersistenceKeys) if (incoming[key] !== undefined) merged[key] = cap(clone(incoming[key]), key);
  return merged;
}
export function persistLivingWorldToWorldState(state = {}, options = {}) {
  const slice = extractLivingWorldPersistenceSlice(state);
  return mutateWorldState(world => {
    world.livingWorld = { ...(world.livingWorld || {}), ...slice, reason:options.reason || 'living-world-persist' };
    world.updatedAt = Date.now();
    return world;
  }).livingWorld;
}
export function hydrateLivingWorldFromWorldState(state = {}, world = loadWorldState()) {
  return mergeLivingWorldPersistenceSlice(state, world.livingWorld || {});
}
export function livingWorldPersistenceSummary(world = loadWorldState()) {
  const slice = world.livingWorld || {};
  return {
    exists:Boolean(world.livingWorld),
    updatedAt:slice.updatedAt || 0,
    activeMissions:Object.keys(slice.activeMissions || {}).length,
    completedMissions:(slice.completedMissions || []).length,
    rumors:(slice.rumors || []).length,
    socialConsequences:(slice.socialConsequences || []).length,
    apologies:(slice.apologies || []).length,
    economyTransactions:(slice.economyTransactions || []).length,
    familyTrust:Object.keys(slice.familyTrust || {}).length,
    events:(slice.eventFeed || []).length,
    services:(slice.servicesVisited || []).length,
    hasEconomy:Boolean(slice.economy),
    hasReputation:Boolean(slice.reputation)
  };
}
export default { livingWorldPersistenceKeys, extractLivingWorldPersistenceSlice, mergeLivingWorldPersistenceSlice, persistLivingWorldToWorldState, hydrateLivingWorldFromWorldState, livingWorldPersistenceSummary };
