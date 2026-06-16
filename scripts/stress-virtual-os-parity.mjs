// B"H
/**
 * Chapter 484: Hosted Virtual OS parity is tested without pretending aliases.
 * Parser contracts are isolated, and bulkWrite behavior is verified through a
 * mocked owned alias so no live user storage is mutated during stress.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parsePlainWrites, describePlainWrites } = require('../geelooy/api/tunnel/control/routes/osFs/plainPayload.js');
const { bulkWrite } = require('../geelooy/api/tunnel/control/routes/osFs/bulkSearch.js');

const PROJECT = 'project/Coby/apps/demo/index.html';
function assertWrites(label, payload, expected) {
  const got = parsePlainWrites(payload);
  assert.deepEqual(got.map(x => ({ path: x.path, content: x.content })), expected, label);
  assert.equal(describePlainWrites(payload).writeCount, expected.length, `${label}: shape count`);
}
function mockRoute() {
  const writes = [];
  return {
    writes,
    db: {
      async get(path) { return path.includes('/users/user/aliases/project') ? { aliasId: 'project' } : null; },
      async write(path, content) { writes.push({ path, content }); return { path, content }; }
    },
    ws: { clients: [] }
  };
}

assertWrites('json string carrier', { writes: JSON.stringify([{ path: PROJECT, content: 'json' }]) }, [{ path: PROJECT, content: 'json' }]);
assertWrites('content nested carrier', { content: JSON.stringify({ writes: [{ filePath: PROJECT, value: 'nested' }] }) }, [{ path: PROJECT, content: 'nested' }]);
assertWrites('object map', { files: { [PROJECT]: 'map' } }, [{ path: PROJECT, content: 'map' }]);
assertWrites('xml cdata', { body: `<writes><file path="${PROJECT}"><content><![CDATA[xml <ok> & whole]]></content></file></writes>` }, [{ path: PROJECT, content: 'xml <ok> & whole' }]);
const empty = describePlainWrites({ writes: 'not-json-and-no-tabs' });
assert.equal(empty.writeCount, 0);
const $i = mockRoute();
let result = await bulkWrite($i, 'user', { writes: JSON.stringify([{ path: PROJECT, content: 'bulk json' }]) });
assert.equal(result.ok, true);
assert.equal(result.count, 1);
assert.equal($i.writes[0].content, 'bulk json');
result = await bulkWrite(mockRoute(), 'user', { body: '<writes></writes>' });
assert.equal(result.ok, false);
assert.equal(result.error, 'no_writes_parsed');
console.log(JSON.stringify({ ok: true, checks: ['json-string', 'nested-carrier', 'object-map', 'xml-cdata', 'bulkWrite', 'empty-guidance'] }, null, 2));
