// B"H
const assert = require('assert');
const fs = require('fs');
const { awtsmoosError, awtsmoosOk, methodNotAllowed, requireArray } = require('../response/routeResponses.js');

const base = awtsmoosError({ code: 'BAD_SPARK', message: 'A malformed vessel arrived.', status: 422, details: { field: 'q' } });
assert.deepEqual(base, { BH: 'B"H', error: true, ok: false, code: 'BAD_SPARK', message: 'A malformed vessel arrived.', status: 422, details: { field: 'q' } });
assert.deepEqual(awtsmoosOk({ id: 'ikar' }).data, { id: 'ikar' });

const method = methodNotAllowed('PATCH', ['GET']);
assert.equal(method.error, true);
assert.equal(method.ok, false);
assert.equal(method.code, 'METHOD_NOT_ALLOWED');
assert.equal(method.status, 405);
assert.deepEqual(method.details.allowed, ['GET']);

assert.deepEqual(requireArray(['a'], 'heichelIds'), { ok: true, value: ['a'] });
assert.equal(requireArray('bad', 'heichelIds').error.code, 'INVALID_ARRAY');

const heichelRoute = fs.readFileSync('geelooy/api/social/_awtsmoos.heichel.js', 'utf8');
assert.match(heichelRoute, /methodNotAllowed/, 'heichel route should use consistent method errors');
assert.match(heichelRoute, /makeHeichelRouteTools/, 'heichel route should use split route tools');

Promise.all(Array.from({ length: 30 }, (_, i) => Promise.resolve(methodNotAllowed(`M${i}`, ['GET'])))).then(results => {
  assert.equal(results.length, 30);
  assert.ok(results.every(item => item.error === true && item.status === 405));
  console.log('B"H responseShapes.test passed');
}).catch(error => { console.error(error); process.exit(1); });
