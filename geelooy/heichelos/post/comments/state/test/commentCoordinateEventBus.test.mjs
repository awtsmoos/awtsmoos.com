// B"H
/**
 * Focused browser-module test for normalized comment coordinates and the local
 * post-reader event bus. Runs in Node as ESM without DOM dependencies.
 */

import assert from 'node:assert/strict';
import {
  normalizeCommentCoordinate,
  coordinateToDayuh,
  coordinateToKey
} from '../commentCoordinate.js';
import {
  onAwtsmoosEvent,
  emitAwtsmoosEvent,
  getAwtsmoosEventHistory,
  clearAwtsmoosEventHistory
} from '../eventBus.js';

globalThis.window = {
  post: { id: 'post-7', parentSeriesId: 'series-3', heichel: { id: 'ikar' } },
  series: { id: 'series-3' },
  location: { search: '?idx=9&sub=2' }
};

clearAwtsmoosEventHistory();

const coordinate = normalizeCommentCoordinate({
  dayuh: { verseSection: '9', subSection: '2', tokenStart: '4', tokenEnd: '8' },
  parentType: 'post'
});

assert.equal(coordinate.heichelId, 'ikar');
assert.equal(coordinate.seriesId, 'series-3');
assert.equal(coordinate.postId, 'post-7');
assert.equal(coordinate.verseSection, 9);
assert.equal(coordinate.subSection, 2);
assert.equal(coordinate.tokenStart, 4);
assert.equal(coordinate.tokenEnd, 8);
assert.equal(coordinate.key, coordinateToKey(coordinate));

const dayuh = coordinateToDayuh(coordinate, { images: [{ img: 'x' }] });
assert.equal(dayuh.verseSection, 9);
assert.equal(dayuh.subSection, 2);
assert.equal(dayuh.coordinate.key, coordinate.key);
assert.equal(dayuh.images[0].img, 'x');

let seen = null;
const off = onAwtsmoosEvent('comment:submitted', packet => { seen = packet; });
const packet = emitAwtsmoosEvent('comment:submitted', { commentId: 'c1', coordinate });
assert.equal(seen, packet);
assert.equal(getAwtsmoosEventHistory('comment:submitted').length, 1);
off();

emitAwtsmoosEvent('comment:submitted', { commentId: 'c2' });
assert.equal(getAwtsmoosEventHistory('comment:submitted').length, 2);

clearAwtsmoosEventHistory();
assert.equal(getAwtsmoosEventHistory().length, 0);

delete globalThis.window;
console.log('B"H commentCoordinateEventBus.test passed');
