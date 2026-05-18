const s = require('./merkava-service');
(async () => {
  const r = await s.simulateRuntime({
    runtime: 'browser',
    entry: 's.js',
    files: { 's.js': 'console.log("BH Merkava");' }
  });
  console.log(JSON.stringify(r, null, 2));
})().catch(e => {
  console.error(e.stack || e.message);
  process.exit(1);
});
