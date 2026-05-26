//B"H
const { put, list, logicalKey } = require('./platformStore.js');
function publishLiveEvent({ $i, channel, type = 'event', payload = {}, actor = '' }) {
  const id = `live_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const event = { id, channel, type, payload, actor, createdAt: Date.now() };
  put({ $i, shard: 'audit', parts: ['live', 'events', channel, id], value: event, meta: { kind: 'liveEvent', channel, type } });
  return event;
}
function subscribeLiveChannel({ $i, aliasId, channel }) {
  const sub = { aliasId, channel, subscribedAt: Date.now(), cursor: 0 };
  put({ $i, shard: 'audit', parts: ['live', 'subscriptions', aliasId, channel], value: sub, meta: { kind: 'liveSubscription', channel } });
  return sub;
}
function setPresence({ $i, aliasId, channel = 'global', status = 'online' }) {
  const presence = { aliasId, channel, status, heartbeatAt: Date.now() };
  put({ $i, shard: 'audit', parts: ['live', 'presence', channel, aliasId], value: presence, meta: { kind: 'livePresence', channel } });
  return presence;
}
function replayLiveEvents({ $i, channel, since = 0, limit = 100 }) {
  return list({ $i, shard: 'audit', predicate: r => r.meta?.kind === 'liveEvent' && r.value?.channel === channel && Number(r.value?.createdAt || 0) > Number(since || 0) })
    .map(r => r.value).sort((a,b)=>a.createdAt-b.createdAt).slice(0, limit);
}
module.exports = { publishLiveEvent, subscribeLiveChannel, setPresence, replayLiveEvents };
