// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'dep.js': `export default class Dep { constructor(){ this.made = 'dep'; } method(){ return 'method'; } }`,
    'middle.js': `import Dep from './dep.js'; export default class Middle { build(){ const item = new Dep(); return { made: item.made, method: item.method() }; } }`,
    'index.js': `window.__awtsmoosResult={phases:['start']}; import('./middle.js').then(m=>{ const middle = new m.default(); window.__awtsmoosResult={phases:['then'], built: middle.build()}; }).catch(e=>{ window.__awtsmoosResult={phases:['catch'], error:e.message}; });`
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 800, returnValues: ['window.__awtsmoosResult','window.__AWTSMOOS_CAPTURED_ERRORS__'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e => e.message), result: r.values['window.__awtsmoosResult'], captured: r.values['window.__AWTSMOOS_CAPTURED_ERRORS__'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
