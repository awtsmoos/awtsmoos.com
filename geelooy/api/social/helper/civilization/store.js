// B"H
/**
 * @module CivilizationStore
 * @description Chapter 618: the event river now flows through AwtsmoosDB native
 * shards, no longer through packed/platform audit mirrors.
 */
const { put, list } = require('../awtsmoosDb/shardStore.js');
const { normalizeEvent, clean } = require('./schema.js');
function eventParts(event) { return ['civilization', 'events', event.type, event.id]; }
function subscriptionParts(aliasId, subject) { return ['civilization', 'subscriptions', clean(aliasId, '', 180), clean(subject, 'all', 240)]; }
function value(record) { return record?.value || record; }
function byTime(a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); }
function matches(event, query = {}) {
  if (query.type && event.type !== query.type) return false;
  if (query.actorAliasId && event.actor?.id !== query.actorAliasId) return false;
  if (query.targetAliasId && !event.targetAliases?.includes(query.targetAliasId) && event.target?.aliasId !== query.targetAliasId) return false;
  if (query.targetType && event.target?.type !== query.targetType) return false;
  if (query.targetId && event.target?.id !== query.targetId) return false;
  if (query.since && Number(event.createdAt || 0) <= Number(query.since || 0)) return false;
  return true;
}
function recordEvent({ input = {} }) {
  const event = normalizeEvent(input);
  put({ shard: 'civilization', parts: eventParts(event), value: event, meta: { kind: 'civilizationEvent', type: event.type } });
  return { success: event };
}
function listEvents({ query = {}, limit = 100 }) {
  const rows = list({ shard: 'civilization', predicate: r => r.meta?.kind === 'civilizationEvent' })
    .map(value).filter(event => matches(event, query)).sort(byTime).slice(0, Number(limit || 100));
  return { success: rows };
}
function subscribe({ aliasId, subject = 'all', options = {} }) {
  const sub = { aliasId: clean(aliasId, '', 180), subject: clean(subject, 'all', 240), options, createdAt: Date.now() };
  put({ shard: 'civilization', parts: subscriptionParts(aliasId, subject), value: sub, meta: { kind: 'civilizationSubscription', aliasId: sub.aliasId } });
  return { success: sub };
}
function listSubscriptions({ aliasId }) {
  const alias = clean(aliasId, '', 180);
  return { success: list({ shard: 'civilization', predicate: r => r.meta?.kind === 'civilizationSubscription' && (!alias || r.value?.aliasId === alias) }).map(value) };
}
module.exports = { recordEvent, listEvents, subscribe, listSubscriptions };
