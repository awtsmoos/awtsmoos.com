// B"H
import assert from 'node:assert/strict';
import { parseReaderPath } from '../logic/initialization/coordinates.js';
const explicit = parseReaderPath('/heichelos/ikar/series/seferHaSichos5748/post/seferHaSichos5748_017_42a56c90');
assert.equal(explicit.hId, 'ikar');
assert.equal(explicit.sId, 'seferHaSichos5748');
assert.equal(explicit.pCoord, 'seferHaSichos5748_017_42a56c90');
assert.equal(explicit.explicitPostMarker, true);
const canonical = parseReaderPath('/heichelos/ikar/series/seferHaSichos5748/17');
assert.equal(canonical.pCoord, '17');
assert.equal(canonical.explicitPostMarker, false);
console.log('B"H deepLinkRouteContract.test passed');
