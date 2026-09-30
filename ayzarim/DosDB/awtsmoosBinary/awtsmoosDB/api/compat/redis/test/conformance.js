// B"H — conformance test for the AwtsmoosDB Redis-compatible API.
// Exercises every command; exits non-zero on any failure.
'use strict';

const path = require('path');
const fs = require('fs');
const { createClient } = require('../index');

const DB = '/tmp/redis-compat-test.awtsdb';
try { fs.unlinkSync(DB); } catch (e) {}

let pass = 0, fail = 0;
function deq(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((x, i) => deq(x, b[i]));
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
    return deq(ka, kb) && ka.every(k => deq(a[k], b[k]));
  }
  return false;
}
function fmt(v) {
  if (v === null || v === undefined) return String(v);
  if (Array.isArray(v)) return '[' + v.map(fmt).join(',') + ']';
  if (typeof v === 'object') return '{' + Object.keys(v).sort().map(k => k + ':' + fmt(v[k])).join(',') + '}';
  return String(v);
}
function eq(name, actual, expected) {
  if (deq(actual, expected)) { pass++; }
  else { fail++; console.log('  FAIL ' + name + ' — got ' + fmt(actual) + ', want ' + fmt(expected)); }
}
async function throws(name, fn, part) {
  try { await fn(); fail++; console.log('  FAIL ' + name + ' — expected throw'); }
  catch (e) {
    if (!part || String(e.message).indexOf(part) !== -1) pass++;
    else { fail++; console.log('  FAIL ' + name + ' — wrong error: ' + e.message); }
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const c = createClient({ database: DB });
  await c.connect();

  // ---- strings ----
  eq('set', await c.set('s1', 'hello'), 'OK');
  eq('get', await c.get('s1'), 'hello');
  eq('get missing', await c.get('nope'), null);
  eq('set NX new', await c.set('nx1', 'a', { NX: true }), 'OK');
  eq('set NX existing', await c.set('nx1', 'b', { NX: true }), null);
  eq('get after NX', await c.get('nx1'), 'a');
  eq('set XX missing', await c.set('xx1', 'a', { XX: true }), null);
  eq('set XX existing', await c.set('nx1', 'z', { XX: true }), 'OK');
  eq('get after XX', await c.get('nx1'), 'z');
  eq('set PX expiry read', await c.set('px1', 'v', { PX: 5000 }), 'OK');
  eq('get before px expiry', await c.get('px1'), 'v');
  await c.set('px2', 'v', { PX: 150 });
  await sleep(400);
  eq('get after px expiry', await c.get('px2'), null);
  eq('getSet old', await c.set('gs1', 'old'), 'OK');
  eq('getSet', await c.getSet('gs1', 'new'), 'old');
  eq('get after getSet', await c.get('gs1'), 'new');
  eq('getSet missing', await c.getSet('gsX', 'v'), null);
  eq('incr missing', await c.incr('n1'), 1);
  eq('incr', await c.incr('n1'), 2);
  eq('incrBy', await c.incrBy('n1', 8), 10);
  eq('decr', await c.decr('n1'), 9);
  eq('decrBy', await c.decrBy('n1', 4), 5);
  await c.set('bad', 'x');
  await throws('incr non-int', () => c.incr('bad'), 'not an integer');
  eq('append new', await c.append('ap1', 'foo'), 3);
  eq('append existing', await c.append('ap1', 'bar'), 6);
  eq('get appended', await c.get('ap1'), 'foobar');
  eq('strLen', await c.strLen('ap1'), 6);
  eq('strLen missing', await c.strLen('zzz'), 0);
  eq('mSet obj', await c.mSet({ m1: 'a', m2: 'b' }), 'OK');
  eq('mGet', await c.mGet(['m1', 'm2', 'mZZ']), ['a', 'b', null]);
  eq('mSet arr', await c.mSet(['m3', 'c']), 'OK');
  eq('get m3', await c.get('m3'), 'c');
  await throws('wrongtype append-on-hash', async () => { await c.hSet('wh1', 'f', 'v'); await c.append('wh1', 'x'); }, 'WRONGTYPE');

  // ---- keys ----
  await c.set('d1', 'x'); await c.set('d2', 'x');
  eq('del count', await c.del(['d1', 'd2', 'dZZ']), 2);
  eq('get after del', await c.get('d1'), null);
  await c.set('e1', 'x'); await c.set('e2', 'x');
  eq('exists', await c.exists(['e1', 'e2', 'eZZ']), 2);
  eq('expire missing', await c.expire('eZZ', 10), false);
  eq('expire ok', await c.expire('e1', 100), true);
  const ttl = await c.ttl('e1');
  eq('ttl range', ttl > 90 && ttl <= 100, true);
  eq('ttl no expire', await c.ttl('e2'), -1);
  eq('ttl missing', await c.ttl('eZZ'), -2);
  eq('persist', await c.persist('e1'), true);
  eq('ttl after persist', await c.ttl('e1'), -1);
  eq('persist no-expire', await c.persist('e2'), false);
  await c.set('user:1', 'a'); await c.set('user:2', 'b'); await c.set('other', 'c');
  const ku = (await c.keys('user:*')).sort();
  eq('keys glob', ku, ['user:1', 'user:2']);
  eq('keys ?', (await c.keys('user:?')).sort(), ['user:1', 'user:2']);
  eq('type string', await c.type('e2'), 'string');
  eq('type none', await c.type('eZZ'), 'none');
  eq('rename', await c.rename('other', 'other2'), 'OK');
  eq('get renamed', await c.get('other2'), 'c');
  eq('get old name', await c.get('other'), null);
  await throws('rename missing', () => c.rename('eZZ', 'x'), 'no such key');

  // ---- hashes ----
  eq('hSet new fields', await c.hSet('h1', { f1: 'a', f2: 'b' }), 2);
  eq('hSet existing', await c.hSet('h1', 'f1', 'A'), 0);
  eq('hSet single new', await c.hSet('h1', 'f3', 'c'), 1);
  eq('hGet', await c.hGet('h1', 'f1'), 'A');
  eq('hGet missing field', await c.hGet('h1', 'fZZ'), null);
  eq('hGet missing key', await c.hGet('hZZ', 'f'), null);
  eq('hGetAll', await c.hGetAll('h1'), { f1: 'A', f2: 'b', f3: 'c' });
  eq('hExists', await c.hExists('h1', 'f2'), true);
  eq('hExists not', await c.hExists('h1', 'fZZ'), false);
  eq('hKeys', (await c.hKeys('h1')).sort(), ['f1', 'f2', 'f3']);
  eq('hVals', (await c.hVals('h1')).sort(), ['A', 'b', 'c']);
  eq('hDel', await c.hDel('h1', ['f3', 'fZZ']), 1);
  eq('hGet after hDel', await c.hGet('h1', 'f3'), null);
  eq('hIncrBy new', await c.hIncrBy('h1', 'cnt', 5), 5);
  eq('hIncrBy', await c.hIncrBy('h1', 'cnt', 2), 7);
  eq('type hash', await c.type('h1'), 'hash');

  // ---- lists ----
  eq('lPush count', await c.lPush('l1', ['a', 'b', 'c']), 3);
  eq('lRange order', await c.lRange('l1', 0, -1), ['c', 'b', 'a']);
  eq('rPush', await c.rPush('l1', ['d']), 4);
  eq('lRange all', await c.lRange('l1', 0, -1), ['c', 'b', 'a', 'd']);
  eq('lRange slice', await c.lRange('l1', 1, 2), ['b', 'a']);
  eq('lRange neg', await c.lRange('l1', -2, -1), ['a', 'd']);
  eq('lPop', await c.lPop('l1'), 'c');
  eq('rPop', await c.rPop('l1'), 'd');
  eq('lLen', await c.lLen('l1'), 2);
  eq('lPop empty missing', await c.lPop('lZZ'), null);
  eq('lRange missing', await c.lRange('lZZ', 0, -1), []);
  eq('type list', await c.type('l1'), 'list');

  // ---- sets ----
  eq('sAdd', await c.sAdd('st1', ['a', 'b', 'c']), 3);
  eq('sAdd dup', await c.sAdd('st1', ['b', 'd']), 1);
  eq('sMembers', (await c.sMembers('st1')).sort(), ['a', 'b', 'c', 'd']);
  eq('sIsMember', await c.sIsMember('st1', 'a'), true);
  eq('sIsMember not', await c.sIsMember('st1', 'z'), false);
  eq('sRem', await c.sRem('st1', ['a', 'z']), 1);
  eq('sCard', await c.sCard('st1'), 3);
  eq('sCard missing', await c.sCard('sZZ'), 0);
  eq('type set', await c.type('st1'), 'set');

  // ---- sorted sets ----
  eq('zAdd', await c.zAdd('z1', [{ score: 3, value: 'c' }, { score: 1, value: 'a' }, { score: 2, value: 'b' }]), 3);
  eq('zRange score order', await c.zRange('z1', 0, -1), ['a', 'b', 'c']);
  eq('zAdd update', await c.zAdd('z1', [{ score: 0, value: 'c' }]), 0);
  eq('zRange after update', await c.zRange('z1', 0, -1), ['c', 'a', 'b']);
  eq('zRank', await c.zRank('z1', 'a'), 1);
  eq('zRank missing', await c.zRank('z1', 'zz'), null);
  eq('zScore', await c.zScore('z1', 'b'), 2);
  eq('zScore missing', await c.zScore('z1', 'zz'), null);
  eq('zCard', await c.zCard('z1'), 3);
  eq('zAdd tie lex', await c.zAdd('z2', [{ score: 5, value: 'b' }, { score: 5, value: 'a' }]), 2);
  eq('zRange tie order', await c.zRange('z2', 0, -1), ['a', 'b']);
  eq('zRange rev', await c.zRange('z2', 0, -1, { REV: true }), ['b', 'a']);
  eq('zRange slice', await c.zRange('z1', 0, 1), ['c', 'a']);
  eq('type zset', await c.type('z1'), 'zset');

  // ---- expiry interplay ----
  await c.set('xp1', 'v', { PX: 150 });
  await sleep(250);
  eq('keys excludes expired-after-wait', (await c.keys('xp*')).indexOf('xp1') === -1, true);
  eq('expired del returns 0', await c.del('xp1'), 0);

  // ---- pub/sub ----
  const sub = c.duplicate();
  await sub.connect();
  const got = [];
  await sub.subscribe('news', (msg, ch) => got.push([ch, msg]));
  eq('publish count', await c.publish('news', 'hello'), 1);
  await sleep(50);
  eq('subscriber got message', got, [['news', 'hello']]);
  eq('publish no subs', await c.publish('quiet', 'x'), 0);
  await sub.unsubscribe('news');
  eq('publish after unsub', await c.publish('news', 'again'), 0);
  await sub.quit();

  // ---- persistence across reopen ----
  await c.set('persist1', 'pval');
  await c.quit();
  const c2 = createClient({ database: DB });
  await c2.connect();
  eq('reopen get', await c2.get('persist1'), 'pval');
  eq('reopen hash', await c2.hGet('h1', 'f1'), 'A');
  eq('reopen zset', await c2.zScore('z1', 'b'), 2);
  await c2.quit();

  console.log('\nconformance: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
