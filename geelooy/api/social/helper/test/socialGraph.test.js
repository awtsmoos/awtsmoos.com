//B"H
const assert = require('assert');
const graph = require('../socialGraph.js');

function makeDb() {
  const store = new Map();
  return {
    store,
    async write(path, value) { store.set(path, value); return { path, value }; },
    async get(path) {
      if (store.has(path)) return store.get(path);
      const prefix = path.endsWith('/') ? path : path + '/';
      const out = {};
      for (const [key, value] of store.entries()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (!rest || rest.includes('/')) continue;
        out[rest] = value;
      }
      return Object.keys(out).length ? out : undefined;
    }
  };
}

(async () => {
  const $i = { db: makeDb() };
  const from = { type: 'post', id: 'p1', heichelId: 'h1', seriesId: 'root', aliasId: 'authorA' };
  const to = { type: 'comment', id: 'c1', heichelId: 'h1', parentId: 'p1', aliasId: 'authorB' };
  const added = await graph.addGraphReference({ $i, from, to, kind: 'quotes', excerpt: 'a spark' });
  assert.equal(added.success.kind, 'quotes');
  assert.equal(added.success.from.id, 'p1');

  const outbound = await graph.listGraphReferences({ $i, entity: from, kind: 'quotes' });
  assert.equal(outbound.success.length, 1);
  const inbound = await graph.listGraphReferences({ $i, entity: to, direction: 'inbound', kind: 'quotes' });
  assert.equal(inbound.success.length, 1);

  const resolved = await graph.resolveEntity({ $i, entity: from });
  assert.equal(resolved.success.entity.type, 'post');
  assert.ok(resolved.success.canonicalPath.includes('/graph/entities/'));

  console.log('B"H socialGraph.test passed');
})().catch(error => { console.error(error); process.exit(1); });
