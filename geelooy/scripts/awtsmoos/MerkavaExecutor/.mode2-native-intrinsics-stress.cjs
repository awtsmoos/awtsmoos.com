// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(() => {
  const c = M.callMode2Intrinsic;
  const arr = [1, 2, 3];
  assert.strictEqual(c('Array.push', arr, 4), 4);
  assert.deepStrictEqual(c('Array.map', arr, x => x * 2), [2, 4, 6, 8]);
  assert.deepStrictEqual(c('Array.filter', arr, x => x % 2 === 0), [2, 4]);
  assert.strictEqual(c('Array.reduce', arr, (a, b) => a + b, 0), 10);
  assert.strictEqual(c('String.toUpperCase', ' bh '), ' BH ');
  assert.deepStrictEqual(c('String.split', 'a,b,c', ','), ['a', 'b', 'c']);
  assert.deepStrictEqual(c('Object.keys', { a: 1, b: 2 }), ['a', 'b']);
  assert.strictEqual(c('Object.hasOwn', { a: 1 }, 'a'), true);
  const map = c('Map.new', null);
  c('Map.set', map, 'x', 42);
  assert.strictEqual(c('Map.get', map, 'x'), 42);
  assert.strictEqual(c('Map.size', map), 1);
  const set = c('Set.new', null, [1, 2]);
  c('Set.add', set, 3);
  assert.strictEqual(c('Set.has', set, 3), true);
  const u8 = c('TypedArray.u8', null, [0, 0, 0, 0]);
  c('TypedArray.set', u8, 1, 255);
  assert.strictEqual(c('TypedArray.get', u8, 1), 255);
  u8[2] = 0x34; u8[3] = 0x12;
  assert.strictEqual(c('DataView.u16le', u8, 2), 0x1234);
  assert.strictEqual(c('Math.max', 5, 9, 1), 9);
  assert.deepStrictEqual(c('JSON.parse', '{"ok":true}'), { ok: true });
  assert.strictEqual(c('JSON.stringify', { ok: true }), '{"ok":true}');
  console.log(JSON.stringify({ ok: true, intrinsicCount: M.INTRINSICS.length, families: ['Array','String','Object','Map','Set','TypedArray','DataView','Math','JSON'] }, null, 2));
})();
