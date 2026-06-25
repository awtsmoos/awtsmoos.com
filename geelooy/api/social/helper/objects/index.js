// B"H
/** Chapter 610: The facade now supports tombstones and adapters for old social
 * objects, while each saved vessel still emits a civilization event.
 */
const store = require('./store.js');
const { searchObjects } = require('./search.js');
const { objectCard } = require('./cards.js');
const { objectTimeline } = require('./timeline.js');
const { objectRelationships } = require('./relationships.js');
const { inspectObject } = require('./inspector.js');
const { objectType, listTypes } = require('./registry.js');
const adapters = require('./adapters.js');
const civ = require('../civilization/index.js');
async function emit({ $i, saved, action = 'object.saved' }) {
  return civ.recordCivilizationEvent({ $i, input: { id: `${action}_${saved.type}_${saved.id}_${Date.now()}`, type: action, actor: saved.creator, target: { type: saved.type, id: saved.id }, payload: { title: saved.title, summary: saved.summary }, targetAliases: saved.creator?.id ? [saved.creator.id] : [] } }).catch(() => null);
}
async function saveUniversalObject({ $i, input = {} }) {
  const saved = store.saveObject({ $i, input }).success;
  await emit({ $i, saved });
  return { success: saved };
}
async function deleteUniversalObject({ $i, type, id, reason }) {
  const deleted = store.deleteObject({ $i, type, id, reason }).success;
  await emit({ $i, saved: deleted, action: 'object.deleted' });
  return { success: deleted };
}
async function adaptUniversalObject({ $i, adapter, input = {} }) {
  const map = { post: adapters.fromPost, series: adapters.fromSeries, comment: adapters.fromComment, alias: x => adapters.fromAlias(x.aliasId || x.id, x.profile || x) };
  const fn = map[adapter];
  if (!fn) return { error: { code: 'BAD_ADAPTER', message: `No adapter named ${adapter}.` } };
  return await saveUniversalObject({ $i, input: fn(input) });
}
function getUniversalObject({ $i, type, id }) { return store.getObject({ $i, type, id }); }
function listUniversalObjects(args) { return store.listObjects(args); }
function searchUniversalObjects(args) { return searchObjects(args); }
function cardForObject({ $i, type, id }) { const got = store.getObject({ $i, type, id }); return got.success ? { success: objectCard(got.success) } : got; }
function timelineForObject({ $i, type, id }) { const got = store.getObject({ $i, type, id }); return got.success ? objectTimeline({ $i, object: got.success }) : got; }
function relationshipsForObject({ $i, type, id }) { const got = store.getObject({ $i, type, id }); return got.success ? objectRelationships({ $i, object: got.success }) : got; }
function inspectUniversalObject({ $i, type, id }) { const got = store.getObject({ $i, type, id }); return got.success ? inspectObject({ $i, object: got.success }) : got; }
module.exports = { saveUniversalObject, deleteUniversalObject, adaptUniversalObject, getUniversalObject, listUniversalObjects, searchUniversalObjects, cardForObject, timelineForObject, relationshipsForObject, inspectUniversalObject, objectType, listTypes };
