// B"H
/**
 * @module SocialEntityUniverseRoutes
 * @description
 * Chapter 173: One API gate for the recursive entity universe. Every object can
 * be created, read, nested, linked, forked, snapshotted, DNA-inspected, and now
 * range-reference loaded from other entities while preserving source comments.
 */

const { er } = require('./helper/general.js');
const { writeEntity, getEntity, listEntities, linkEntities, listEdges, addChild, getChildren, snapshotEntity, forkEntity, getDna } = require('./helper/entityUniverse/universeStore.js');
const { resolveRangeReference, attachRangeReference } = require('./helper/entityUniverse/rangeReferences.js');

function method($i, expected) {
  return $i.request.method === expected ? null : er({ code: 'BAD_METHOD', message: `Use ${expected}.` });
}

function jsonField(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

module.exports = ({ $i } = {}) => ({
  '/entities/universe': async () => {
    if ($i.request.method === 'GET') return await listEntities({ $i, type: $i.$_GET.type || '', aliasId: $i.$_GET.aliasId || '', heichelId: $i.$_GET.heichelId || '', seriesId: $i.$_GET.seriesId || '' });
    if ($i.request.method === 'POST') return await writeEntity({ $i, input: $i.$_POST || {} });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },

  '/entities/universe/:type/:id': async vars => {
    const bad = method($i, 'GET');
    if (bad) return bad;
    return await getEntity({ $i, type: vars.type, id: vars.id });
  },

  '/entities/universe/:type/:id/children': async vars => {
    if ($i.request.method === 'GET') return await getChildren({ $i, entity: vars });
    if ($i.request.method === 'POST') return await addChild({ $i, parent: vars, child: $i.$_POST || {} });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },

  '/entities/universe/:type/:id/edges': async vars => {
    if ($i.request.method === 'GET') return await listEdges({ $i, entity: vars, direction: $i.$_GET.direction || 'out' });
    if ($i.request.method === 'POST') return await linkEntities({ $i, from: { ...vars }, to: jsonField($i.$_POST.to), kind: $i.$_POST.kind || 'references', note: $i.$_POST.note || '', actorAlias: $i.$_POST.actorAlias || $i.$_POST.aliasId || '' });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },

  '/entities/universe/:type/:id/range-reference/preview': async vars => {
    const bad = method($i, 'GET');
    if (bad) return bad;
    return await resolveRangeReference({ $i, reference: { source: jsonField($i.$_GET.source, { type: vars.type, id: vars.id }), startNodeId: $i.$_GET.startNodeId || '', endNodeId: $i.$_GET.endNodeId || '', limit: $i.$_GET.limit || 40 } });
  },

  '/entities/universe/:type/:id/range-reference/attach': async vars => {
    const bad = method($i, 'POST');
    if (bad) return bad;
    return await attachRangeReference({ $i, target: vars, reference: jsonField($i.$_POST.reference, $i.$_POST || {}) });
  },

  '/entities/universe/:type/:id/snapshot': async vars => {
    const bad = method($i, 'POST');
    if (bad) return bad;
    return await snapshotEntity({ $i, entity: vars, label: $i.$_POST.label || '' });
  },

  '/entities/universe/:type/:id/fork': async vars => {
    const bad = method($i, 'POST');
    if (bad) return bad;
    return await forkEntity({ $i, entity: vars, aliasId: $i.$_POST.aliasId || '', title: $i.$_POST.title || '' });
  },

  '/entities/universe/:type/:id/dna': async vars => {
    const bad = method($i, 'GET');
    if (bad) return bad;
    return await getDna({ $i, entity: vars });
  }
});
