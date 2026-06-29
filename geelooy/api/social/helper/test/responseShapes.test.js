// B"H
const assert = require('assert');
const { awtsmoosError, methodNotAllowed, requireArray } = require('../response/routeResponses.js');

const base = awtsmoosError({ code: 'BAD_SPARK', message: 'A malformed vessel arrived.', status: 422, details: { field: 'q' } });
assert.deepEqual(base, { BH: 'B"H', error: true, code: 'BAD_SPARK', message: 'A malformed vessel arrived.', status: 422, details: { field: 'q' } });

const method = methodNotAllowed('PATCH', ['GET']);
assert.equal(method.error, true);
assert.equal(method.code, 'METHOD_NOT_ALLOWED');
assert.equal(method.status, 405);
assert.deepEqual(method.details.allowed, ['GET']);

assert.deepEqual(requireArray(['a'], 'heichelIds'), { ok: true, value: ['a'] });
assert.equal(requireArray('bad', 'heichelIds').error.code, 'INVALID_ARRAY');

const burst = Promise.all(Array.from({ length: 30 }, (_, i) => Promise.resolve(methodNotAllowed(`M${i}`, ['GET']))));
burst.then(results => {
  assert.equal(results.length, 30);
  assert.ok(results.every(item => item.error === true && item.status === 405));
  console.log('B"H responseShapes.test passed');
}).catch(error => { console.error(error); process.exit(1); });
