// B"H — benchmark for the AwtsmoosDB Redis-compatible API: the speed showcase.
// 10k SETs + 10k GETs, sequential, reporting avg/p50/p95/p99.
'use strict';

const fs = require('fs');
const { createClient } = require('../index');

const DB = '/tmp/redis-compat-bench.awtsdb';
try { fs.unlinkSync(DB); } catch (e) {}

function stats(times) {
  const s = [...times].sort((a, b) => a - b);
  const q = p => s[Math.min(s.length - 1, Math.floor(p / 100 * s.length))];
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return { n: times.length, avg: +avg.toFixed(3), p50: +q(50).toFixed(3), p95: +q(95).toFixed(3), p99: +q(99).toFixed(3), max: +s[s.length - 1].toFixed(1) };
}

(async () => {
  const c = createClient({ database: DB });
  await c.connect();
  const N = parseInt(process.argv[2] || '10000', 10);
  const setT = [];
  for (let i = 0; i < N; i++) {
    const t0 = process.hrtime.bigint();
    await c.set('bk' + i, 'value-number-' + i);
    setT.push(Number(process.hrtime.bigint() - t0) / 1e6);
    if ((i + 1) % 2500 === 0) console.log('  sets: ' + (i + 1) + '/' + N);
  }
  const getT = [];
  for (let i = 0; i < N; i++) {
    const t0 = process.hrtime.bigint();
    const v = await c.get('bk' + i);
    if (v !== 'value-number-' + i) throw new Error('MISMATCH at ' + i);
    getT.push(Number(process.hrtime.bigint() - t0) / 1e6);
    if ((i + 1) % 2500 === 0) console.log('  gets: ' + (i + 1) + '/' + N);
  }
  const f = s => 'n=' + s.n + ' avg=' + s.avg + 'ms p50=' + s.p50 + ' p95=' + s.p95 + ' p99=' + s.p99 + ' max=' + s.max;
  console.log('SET ' + f(stats(setT)));
  console.log('GET ' + f(stats(getT)));
  console.log('file bytes: ' + fs.statSync(DB).size);
  await c.quit();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
