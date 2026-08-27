// B"H
/**
 * @module SocialRagTimer
 * @description Every search breath has a measure. The API reports the time it
 * took to call local llama, score vectors, and hydrate comments from the living
 * database, so latency is visible instead of hidden.
 */
function now() { return Number(process.hrtime.bigint()) / 1e6; }
async function timed(label, timings, fn) {
  const start = now();
  try { return await fn(); }
  finally { timings[label] = Number((now() - start).toFixed(3)); }
}
module.exports = { now, timed };
