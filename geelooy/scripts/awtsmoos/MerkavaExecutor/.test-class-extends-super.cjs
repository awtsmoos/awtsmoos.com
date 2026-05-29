// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'base.js': `export default class Base { events = {}; constructor(){ this.baseMade = 'yes'; } clear(){ return 'clear-lit'; } }`,
    'child.js': `import Base from './base.js'; export default class Child extends Base { own = 9; constructor(){ super(); this.childMade = 'yes'; } }`,
    'index.js': `window.__awtsmoosResult={phases:['start']}; import('./child.js').then(m=>{ const c=new m.default(); window.__awtsmoosResult={phases:['then'], baseMade:c.baseMade, childMade:c.childMade, own:c.own, eventsType:typeof c.events, clear:typeof c.clear, clearValue:c.clear&&c.clear()}; }).catch(e=>{ window.__awtsmoosResult={phases:['catch'], error:e.message}; });`
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 800, returnValues: ['window.__awtsmoosResult','window.__AWTSMOOS_CAPTURED_ERRORS__'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e=>e.message), result: r.values['window.__awtsmoosResult'], captured: r.values['window.__AWTSMOOS_CAPTURED_ERRORS__'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
