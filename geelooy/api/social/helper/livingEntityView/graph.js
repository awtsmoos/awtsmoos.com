// B"H
/**
 * @module LivingEntityGraph
 * @description
 * Chapter 7: The graph is the thunder behind the letters. Old socialGraph edges
 * and new universe DNA both speak here as inbound, outbound, citations, answers,
 * references, and forks, while the adapter remains read-only and harmless.
 */

const { listGraphReferences } = require('../socialGraph.js');
const { getDna } = require('../entityUniverse/universeStore.js');
const { safeCall } = require('./read.js');

async function oldEdges({ $i, identity }) {
  const entity = {
    type: identity.type,
    id: identity.id,
    heichelId: identity.heichelId,
    seriesId: identity.seriesId,
    aliasId: identity.aliasId
  };
  const outbound = await safeCall(() => listGraphReferences({ $i, entity, direction: 'outbound', kind: 'references' }), { success: [] });
  const inbound = await safeCall(() => listGraphReferences({ $i, entity, direction: 'inbound', kind: 'references' }), { success: [] });
  const answers = await safeCall(() => listGraphReferences({ $i, entity, direction: 'inbound', kind: 'answers' }), { success: [] });
  return { inbound: inbound.success || [], outbound: outbound.success || [], answers: answers.success || [] };
}

async function universeDna({ $i, identity }) {
  const got = await safeCall(() => getDna({ $i, entity: { type: identity.type, id: identity.id } }), null);
  return got && got.success ? got.success : null;
}

async function graphFromIdentity({ $i, identity }) {
  const [old, dna] = await Promise.all([oldEdges({ $i, identity }), universeDna({ $i, identity })]);
  return {
    inbound: old.inbound,
    outbound: old.outbound,
    references: dna?.references || old.outbound,
    answers: dna?.answers || old.answers,
    citations: dna?.citations || old.inbound,
    forks: dna?.forks || [],
    dna
  };
}

module.exports = { graphFromIdentity, oldEdges, universeDna };
