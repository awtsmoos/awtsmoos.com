// B"H
/**
 * @module CivilizationEngine
 * @description Chapter 550: the small facade where event, feed, subscription,
 * inbox projection, entity state, and civilization pulse become one river.
 */

const store = require('./store.js');
const { projectEvent, feedForAlias } = require('./projections.js');
const { civilizationState } = require('./state.js');
const { getDna } = require('../entityUniverse/universeStore.js');

async function recordCivilizationEvent({ $i, input = {} }) {
  const result = store.recordEvent({ $i, input });
  const projections = await projectEvent({ $i, event: result.success });
  return { success: { ...result.success, projections } };
}
function listCivilizationEvents({ $i, query = {}, limit = 100 }) {
  return store.listEvents({ $i, query, limit });
}
function civilizationFeed({ $i, aliasId, limit = 100 }) {
  const events = store.listEvents({ $i, query: {}, limit: 500 }).success || [];
  return { success: feedForAlias({ events, aliasId }).slice(0, Number(limit || 100)) };
}
function subscribeCivilization({ $i, aliasId, subject, options = {} }) {
  return store.subscribe({ $i, aliasId, subject, options });
}
function listCivilizationSubscriptions({ $i, aliasId }) {
  return store.listSubscriptions({ $i, aliasId });
}
async function civilizationEntityState({ $i, type, id }) {
  const events = store.listEvents({ $i, query: { targetType: type, targetId: id }, limit: 200 }).success || [];
  const dna = await getDna({ $i, entity: { type, id } }).catch(error => ({ error: { message: String(error.message || error) } }));
  return { success: { entity: { type, id }, events, dna: dna.success || null, eventCount: events.length, lastEvent: events[0] || null } };
}
function getCivilizationState({ $i }) {
  const events = store.listEvents({ $i, query: {}, limit: 1000 }).success || [];
  const subscriptions = store.listSubscriptions({ $i, aliasId: '' }).success || [];
  return { success: civilizationState({ events, subscriptions }) };
}

module.exports = { recordCivilizationEvent, listCivilizationEvents, civilizationFeed, subscribeCivilization, listCivilizationSubscriptions, civilizationEntityState, getCivilizationState };
