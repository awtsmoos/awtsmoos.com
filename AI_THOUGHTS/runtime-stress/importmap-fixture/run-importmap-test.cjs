// B"H
const fs = require('fs');
const path = require('path');
const { RuntimeAssembler } = require('../../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js');
const root = 'AI_THOUGHTS/runtime-stress/importmap-fixture';
const files = {};
for (const f of ['index.html', 'main.js', 'lib/three.module.js']) files[root + '/' + f] = fs.readFileSync(path.join(root, f), 'utf8');
const keepAlive = setTimeout(() => {
  console.error('IMPORTMAP_TIMEOUT');
  process.exit(3);
}, 5000);
(async () => {
  const asm = new RuntimeAssembler({ files, entry: root + '/index.html', runtime: 'browser', waitMs: 20 });
  const out = await asm.run(root + '/index.html');
  const text = out.runtime.window.document.getElementById('out').textContent;
  const result = { ok: out.ok, text, errors: out.runtime.errors || [], importMaps: out.assembly.html.importMaps };
  fs.writeFileSync(path.join(root, 'result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  clearTimeout(keepAlive);
  process.exit(text === 'real-613' ? 0 : 2);
})().catch(error => {
  clearTimeout(keepAlive);
  console.error(error.stack || error.message);
  process.exit(1);
});
