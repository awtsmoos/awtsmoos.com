// B"H
(async () => {
  const m = await import('./merkava-service/index.js');
  const files = {
    'index.html': '<body><script type="module" src="./index.js"></script></body>',
    'index.js': `
      window.__awtsmoosResult = { phases: ['outer:start'] };
      import('./inner.js').then(module => {
        window.__awtsmoosResult.phases.push('outer:then');
        window.__awtsmoosResult.keys = Object.keys(module || {});
        window.__awtsmoosResult.value = module.value;
      }).catch(error => window.__awtsmoosResult.phases.push('outer:catch:' + error.message));
    `,
    'dep.js': `
      window.__awtsmoosResult.phases.push('dep:evaluated');
      export default class Dep { constructor(){ window.__awtsmoosResult.phases.push('dep:new'); } }
    `,
    'inner.js': `
      import Dep from './dep.js';
      window.__awtsmoosResult.phases.push('inner:evaluated');
      new Dep();
      export const value = 11;
    `
  };
  const r = await m.simulateRuntime({ files, entry: 'index.html', waitMs: 500, returnValues: ['window.__awtsmoosResult'] });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors, result: r.values['window.__awtsmoosResult'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
