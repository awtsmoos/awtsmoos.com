// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    's.js': 'const R=/^ladder-\\d+\\.json$/; window.__awtsmoosResult={isRegExp:R instanceof RegExp, source:R.source, ok:R.test("ladder-1.json"), clean:String("ladder-1.json").split("/").pop()};'
  };
  const r = await m.simulateRuntime({ files, entry: 's.js', returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
