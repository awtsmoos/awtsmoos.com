// B"H
import assert from 'node:assert/strict';
import { PropBuilder } from '../../src/core/renderer/props/PropBuilder.js';
const props = [
  { id: 'book', type: 'book', size: 38 },
  { id: 'soup', type: 'soup', size: 50 },
  { id: 'cup', type: 'cup', size: 18 },
  { id: 'lunch', type: 'lunchbox', size: 42 }
].map(p => JSON.stringify(PropBuilder.build(p))).join('\n');
for (const word of ['prod_book', 'prod_soup', 'prod_cup', 'prop_lunchbox']) assert.ok(props.includes(word), word);
console.log('B"H insert shot smoke passed');
