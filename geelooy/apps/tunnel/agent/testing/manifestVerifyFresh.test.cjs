// B"H
const assert = require('assert');
const { verify } = require('../scripts/verify-manifest.cjs');
const result = verify();
assert.equal(result.ok, true);
assert.equal(result.message, 'manifest_fresh');
assert.match(result.version, /^\d+\.\d+\.\d+$/);
console.log('manifest verifier accepts current bumped manifest without phantom bump');
