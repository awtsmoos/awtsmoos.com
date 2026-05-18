const s = require('./merkava-service');
(async () => {
  const r = await s.simulateRuntime({
    runtime: 'browser',
    entry: 's.js',
    files: { 's.js': 'let name = "Awtsmoos";\nconsole.log(name);' },
    probes: [{ file: 's.js', line: 2, variable: 'name' }],
    interactions: []
  });
  console.log(JSON.stringify(r, null, 2));
})().catch(e => {
  console.error(e.stack || e.message);
  process.exit(1);
});
