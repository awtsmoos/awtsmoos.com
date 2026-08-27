// B"H
/**
 * @module SocialNodeOsRoutes
 * @description
 * Chapter 188: A filesystem API over social reality. It is additive and
 * fallback-first: old APIs keep working, while every object can also be read as
 * a node with children and migration manifests.
 */

const { er } = require('./helper/general.js');
const { getNode, getByPath, childrenOf, writeNode, mountUniverseEntity, mountAliasAssets } = require('./helper/nodeOs/nodeOsStore.js');
const { dryRunNodeOsMigration, runNodeOsMigration } = require('./helper/nodeOs/migration.js');

function method($i, expected) {
  return $i.request.method === expected ? null : er({ code: 'BAD_METHOD', message: `Use ${expected}.` });
}

module.exports = ({ $i } = {}) => ({
  '/node-os/path': async () => {
    const bad = method($i, 'GET');
    if (bad) return bad;
    return await getByPath({ $i, path: $i.$_GET.path || '/' });
  },

  '/node-os/nodes/:node': async vars => {
    const bad = method($i, 'GET');
    if (bad) return bad;
    return await getNode({ $i, nodeId: vars.node });
  },

  '/node-os/nodes/:node/children': async vars => {
    const bad = method($i, 'GET');
    if (bad) return bad;
    return await childrenOf({ $i, nodeId: vars.node });
  },

  '/node-os/nodes': async () => {
    const bad = method($i, 'POST');
    if (bad) return bad;
    return await writeNode({ $i, input: $i.$_POST || {} });
  },

  '/node-os/mount/entity/:type/:id': async vars => {
    const bad = method($i, 'POST');
    if (bad) return bad;
    return await mountUniverseEntity({ $i, type: vars.type, id: vars.id });
  },

  '/node-os/mount/assets/:alias': async vars => {
    const bad = method($i, 'POST');
    if (bad) return bad;
    return await mountAliasAssets({ $i, aliasId: vars.alias });
  },

  '/node-os/migrations/dry-run': async () => {
    const bad = method($i, 'GET');
    if (bad) return bad;
    return await dryRunNodeOsMigration({ $i });
  },

  '/node-os/migrations/run': async () => {
    const bad = method($i, 'POST');
    if (bad) return bad;
    const aliases = String($i.$_POST.aliasIds || '').split(',').map(x => x.trim()).filter(Boolean);
    return await runNodeOsMigration({ $i, dryRun: $i.$_POST.dryRun === 'true', aliasIds: aliases });
  }
});
