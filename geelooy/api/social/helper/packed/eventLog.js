//B"H
/**
 * @module eventLog
 * @description Append-only event sourcing layer inside audit shard.
 */

const { logicalKey } = require('./shardPaths.js');
const { writePacked, listPackedRecords } = require('./socialPacked.js');

function eventKey(event) {
  return logicalKey(['events', event.type || 'event', event.id || `${Date.now()}_${Math.random().toString(36).slice(2)}`]);
}

function appendSocialEvent({ $i, type, entity = {}, data = {}, actor = '', id }) {
  const event = { id: id || `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`, type, entity, data, actor, createdAt: Date.now() };
  writePacked({ $i, shard: 'audit', key: eventKey(event), value: event, meta: { kind: 'socialEvent', type } });
  return event;
}

function listSocialEvents({ $i, type }) {
  return listPackedRecords({ $i, shard: 'audit' })
    .filter(record => record.meta?.kind === 'socialEvent')
    .filter(record => !type || record.value?.type === type);
}

module.exports = { appendSocialEvent, listSocialEvents };
