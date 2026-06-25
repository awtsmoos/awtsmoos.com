// B"H
/**
 * @module SocialUniversalObjectRoutes
 * @description Chapter 611: canonical `/api/social/objects/*` routes now include
 * CRUD tombstones and adapters for old social vessels.
 */
const { er } = require('./helper/general.js');
const objects = require('./helper/objects/index.js');
function is($i, method) { return $i.request.method === method; }
function bad(method) { return er({ code: 'BAD_METHOD', message: `Use ${method}.` }); }
function input($i) { return { ...($i.$_GET || {}), ...($i.$_POST || {}) }; }
function parse(value, fallback) { if (value && typeof value === 'object') return value; try { return JSON.parse(value || ''); } catch { return fallback; } }
function objectInput($i) {
  const raw = input($i);
  return { ...raw, creator: parse(raw.creator, raw.creator), relationships: parse(raw.relationships, raw.relationships), metadata: parse(raw.metadata, raw.metadata), tags: parse(raw.tags, raw.tags), renderer: parse(raw.renderer, raw.renderer), permissions: parse(raw.permissions, raw.permissions) };
}
module.exports = ({ $i } = {}) => ({
  '/objects/types': async () => is($i, 'GET') ? { success: objects.listTypes() } : bad('GET'),
  '/objects': async () => {
    if (is($i, 'POST')) return await objects.saveUniversalObject({ $i, input: objectInput($i) });
    if (is($i, 'GET')) return objects.listUniversalObjects({ $i, query: $i.$_GET || {}, limit: Number($i.$_GET?.limit || 100) });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/objects/adapt/:adapter': async vars => is($i, 'POST') ? await objects.adaptUniversalObject({ $i, adapter: vars.adapter, input: objectInput($i) }) : bad('POST'),
  '/objects/search': async () => is($i, 'GET') ? objects.searchUniversalObjects({ $i, q: $i.$_GET?.q || '', type: $i.$_GET?.type || '', limit: Number($i.$_GET?.limit || 50) }) : bad('GET'),
  '/objects/:type/:id': async vars => {
    if (is($i, 'GET')) return objects.getUniversalObject({ $i, type: vars.type, id: vars.id });
    if (is($i, 'DELETE')) return await objects.deleteUniversalObject({ $i, type: vars.type, id: vars.id, reason: $i.$_GET?.reason || 'deleted' });
    return er({ code: 'BAD_METHOD', message: 'Use GET or DELETE.' });
  },
  '/objects/:type/:id/card': async vars => is($i, 'GET') ? objects.cardForObject({ $i, type: vars.type, id: vars.id }) : bad('GET'),
  '/objects/:type/:id/timeline': async vars => is($i, 'GET') ? objects.timelineForObject({ $i, type: vars.type, id: vars.id }) : bad('GET'),
  '/objects/:type/:id/relationships': async vars => is($i, 'GET') ? objects.relationshipsForObject({ $i, type: vars.type, id: vars.id }) : bad('GET'),
  '/objects/:type/:id/inspect': async vars => is($i, 'GET') ? objects.inspectUniversalObject({ $i, type: vars.type, id: vars.id }) : bad('GET')
});
