// B"H
// Registry integrity simulation: rewards and monster moves must resolve after full module aggregation.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { items } from '../../js/data/items.js';
import { moves } from '../../js/data/moves.js';

function walk(dir) {
  let out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out = out.concat(walk(path));
    else if (path.endsWith('.js')) out.push(path);
  }
  return out;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = walk('js').map(path => readFileSync(path, 'utf8')).join('\n');
const giveItems = new Set([...source.matchAll(/giveItem\s*:\s*['"]([^'"]+)['"]/g)].map(match => match[1]));
const moveRefs = new Set();
for (const block of source.matchAll(/moves\s*:\s*\[([^\]]*)\]/g)) {
  for (const move of block[1].matchAll(/['"]([^'"]+)['"]/g)) moveRefs.add(move[1]);
}

const expectedCriticalItems = [
  'golden_dreidel',
  'maccabee_shield_fragment',
  'sealed_oil',
  'hidden_oil',
  'refined_metal',
  'spark_tohu_1234'
];
const expectedCriticalMoves = [
  'Absolute_Zero',
  'Chaos_Theory',
  'Chokhmah_Flash',
  'Share_Bounty',
  'Fire_Breath',
  'Judge'
];

for (const id of expectedCriticalItems) assert(items[id], `Critical item missing from registry: ${id}`);
for (const id of expectedCriticalMoves) assert(moves[id], `Critical move missing from registry: ${id}`);

const missingGiveItems = [...giveItems].filter(id => !items[id]).sort();
const missingMoveRefs = [...moveRefs].filter(id => !moves[id]).sort();
assert(missingGiveItems.length === 0, `Unresolved giveItem refs: ${missingGiveItems.join(', ')}`);
assert(missingMoveRefs.length === 0, `Unresolved move refs: ${missingMoveRefs.join(', ')}`);

for (let i = 0; i < 500; i++) {
  const itemId = expectedCriticalItems[i % expectedCriticalItems.length];
  const moveId = expectedCriticalMoves[i % expectedCriticalMoves.length];
  const item = items[itemId];
  const move = moves[moveId];
  assert(item.id === itemId, `Item id mismatch for ${itemId}`);
  assert(typeof item.name === 'string' && item.name.length > 0, `Item missing name: ${itemId}`);
  assert(typeof move.name === 'string' && move.name.length > 0, `Move missing name: ${moveId}`);
  assert(Number.isFinite(move.power) || move.power === 0, `Move power must be numeric: ${moveId}`);
}

console.log(JSON.stringify({ ok: true, items: Object.keys(items).length, moves: Object.keys(moves).length, giveItems: giveItems.size, moveRefs: moveRefs.size, simulations: 500 }));
