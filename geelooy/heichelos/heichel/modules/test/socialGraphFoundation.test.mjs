// B"H
import assert from 'node:assert/strict';
import { EDGE_TYPES, isEdgeType } from '../social/edgeTypes.js';
import { normalizeTarget, targetKey } from '../social/targets.js';
import { createQuoteLink } from '../social/quotes.js';
import { registerEntityRenderer, getEntityRenderer, listEntityRenderers } from '../social/entityRendererRegistry.js';

assert.equal(isEdgeType(EDGE_TYPES.QUOTES), true);
assert.equal(isEdgeType('banana'), false);

const target = normalizeTarget({ entityId: 'p1', sectionId: 's2' });
assert.equal(target.entityType, 'post');
assert.match(targetKey(target), /p1/);

const quote = createQuoteLink({
  source: { entityType: 'comment', entityId: 'c1' },
  target: { entityType: 'post', entityId: 'p1', sectionId: 's2' },
  text: 'Quoted truth'
});
assert.equal(quote.edgeType, EDGE_TYPES.QUOTES);
assert.equal(quote.target.sectionId, 's2');

registerEntityRenderer('question', value => value.title);
assert.equal(getEntityRenderer('question')({ title: 'Awtsmoos' }), 'Awtsmoos');
assert.ok(listEntityRenderers().includes('question'));

console.log('B"H socialGraphFoundation.test passed');
