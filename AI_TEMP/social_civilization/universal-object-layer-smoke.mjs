// B"H
import fs from 'node:fs/promises';
const files = {
  route: 'geelooy/api/social/_awtsmoos.objects.js', derech: 'geelooy/api/social/_awtsmoos.derech.js',
  schema: 'geelooy/api/social/helper/objects/schema.js', registry: 'geelooy/api/social/helper/objects/registry.js',
  store: 'geelooy/api/social/helper/objects/store.js', adapters: 'geelooy/api/social/helper/objects/adapters.js',
  search: 'geelooy/api/social/helper/objects/search.js', cards: 'geelooy/api/social/helper/objects/cards.js',
  timeline: 'geelooy/api/social/helper/objects/timeline.js', relationships: 'geelooy/api/social/helper/objects/relationships.js',
  inspector: 'geelooy/api/social/helper/objects/inspector.js', health: 'geelooy/api/social/helper/objects/health.js',
  metrics: 'geelooy/api/social/helper/objects/metrics.js', index: 'geelooy/api/social/helper/objects/index.js',
  livingCard: 'geelooy/api/social/helper/profile/livingCard.js'
};
const checks = [];
function assert(ok, label, detail = {}) { if (!ok) { const e = new Error(label); e.detail = detail; throw e; } checks.push(label); }
async function read(key) { return fs.readFile(files[key], 'utf8'); }
try {
  const route = await read('route');
  const derech = await read('derech');
  assert(route.includes('/objects/types'), 'typesRoute');
  assert(route.includes('/objects/adapt/:adapter'), 'adapterRoute');
  assert(route.includes("is($i, 'DELETE')"), 'deleteTombstoneRoute');
  assert(route.includes('/objects/:type/:id/inspect'), 'inspectRoute');
  assert(route.includes('/objects/search'), 'searchRoute');
  assert(derech.includes('const objects = require("./_awtsmoos.objects.js")'), 'derechRequiresObjects');
  assert(derech.includes('...objects(vessel)'), 'derechMountsObjects');
  assert((await read('schema')).includes('normalizeObject'), 'schemaNormalizesObject');
  assert((await read('registry')).includes('post') && (await read('registry')).includes('window') && (await read('registry')).includes('agent'), 'registryCoreTypes');
  const store = await read('store');
  assert(store.includes('deleteObject'), 'storeDeleteObject');
  assert(store.includes('lifecycle !== \'deleted\''), 'storeHidesDeleted');
  const adapters = await read('adapters');
  assert(adapters.includes('fromPost') && adapters.includes('fromSeries') && adapters.includes('fromComment') && adapters.includes('fromAlias'), 'adapterFunctions');
  const index = await read('index');
  assert(index.includes('saveUniversalObject'), 'facadeSave');
  assert(index.includes('deleteUniversalObject'), 'facadeDelete');
  assert(index.includes('adaptUniversalObject'), 'facadeAdapter');
  assert(index.includes('inspectUniversalObject'), 'facadeInspect');
  assert(index.includes('recordCivilizationEvent'), 'objectEmitsCivilizationEvent');
  assert((await read('livingCard')).includes('universalObject'), 'livingCardIncludesUniversalObject');
  for (const [key, path] of Object.entries(files)) {
    const text = await fs.readFile(path, 'utf8');
    assert(!text.includes('/api/v2/social'), `${key}NoV2`);
  }
  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
