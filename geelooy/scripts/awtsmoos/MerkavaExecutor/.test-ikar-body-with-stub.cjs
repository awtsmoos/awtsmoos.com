// B"H
(async () => {
  const fs = require('fs');
  const path = require('path');
  const m = await import('./merkava-service/index.js');
  const repo = path.resolve(__dirname, '../../../..');
  const ikarPath = path.join(repo, 'geelooy/games/mitzvahWorld/ckidsAwtsmoos/ikar.js');
  const ikar = fs.readFileSync(ikarPath, 'utf8').replace(
    /import ManagerOfAllWorlds[^;]+;/,
    `class ManagerOfAllWorlds { constructor(){ window.__AWTSMOOS_IKAR_PHASES__ ||= []; window.__AWTSMOOS_IKAR_PHASES__.push({ phase: 'stub-manager:new' }); this.ui = { $g(id){ return document.getElementById(id) || document.createElement('div'); } }; } }`
  );
  const files = {
    'index.html': '<body><div id="ikar"></div><script type="module" src="./ikar.js"></script></body>',
    'ikar.js': ikar
  };
  const r = await m.simulateRuntime({
    files,
    entry: 'index.html',
    url: 'http://localhost:8080/games/mitzvahWorld/?path=ladder-1.json&v=stub',
    waitMs: 1200,
    returnValues: ['window.__AWTSMOOS_IKAR_PHASES__', 'window.mana']
  });
  console.log(JSON.stringify({ ok: r.ok, errors: r.errors?.map(e => e.message), phases: r.values['window.__AWTSMOOS_IKAR_PHASES__'], hasMana: !!r.values['window.mana'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
