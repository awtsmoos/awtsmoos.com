//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked graph, notification and migration-manifest mirrors (split from socialPacked.js).
 */
const { logicalKey } = require('./shardPaths.js');
const { RECORD_TYPES } = require('./recordEnvelope.js');
const { writePacked } = require('./socialPackedCore.js');
const { writeIndex, appendEvent } = require('./socialPackedMirror.js');
function indexGraph({ $i, reference }) {
  const value = { id: reference.id, kind: reference.kind, from: reference.from, to: reference.to, updatedAt: Date.now() };
  writeIndex({ $i, key: logicalKey(['indexes', 'graphOut', reference.from?.type, reference.from?.id, reference.id]), value, meta: { index: 'graphOut', edgeKind: reference.kind } });
  writeIndex({ $i, key: logicalKey(['indexes', 'graphIn', reference.to?.type, reference.to?.id, reference.id]), value, meta: { index: 'graphIn', edgeKind: reference.kind } });
}
function mirrorGraphReference({ $i, reference }) {
  const write = writePacked({ $i, shard: 'graph', key: logicalKey(['graph', reference.kind, reference.id]), value: reference, type: RECORD_TYPES.graphEdge, meta: { kind: 'graph', edgeKind: reference.kind } });
  indexGraph({ $i, reference });
  appendEvent({ $i, type: 'graph.edge.mirrored', actor: reference.aliasId || '', entity: { kind: 'graphEdge', id: reference.id }, data: { edgeKind: reference.kind } });
  return write;
}
function mirrorNotification({ $i, notification }) {
  const write = writePacked({ $i, shard: 'notify', key: logicalKey(['notifications', notification.toAliasId, notification.id]), value: notification, type: RECORD_TYPES.notification, meta: { kind: 'notification', type: notification.type } });
  appendEvent({ $i, type: 'notification.mirrored', actor: notification.fromAliasId || '', entity: { kind: 'notification', id: notification.id }, data: { toAliasId: notification.toAliasId, type: notification.type } });
  return write;
}
function writeMigrationManifest({ $i, manifest }) { return writePacked({ $i, shard: 'meta', key: logicalKey(['migrations', manifest.id]), value: manifest, type: RECORD_TYPES.migrationManifest, meta: { kind: 'migrationManifest', migrationType: manifest.type } }); }
module.exports = { indexGraph, mirrorGraphReference, mirrorNotification, writeMigrationManifest };
