// B"H
const assert = require('assert');
const MerkavaExecutor = require('./merkavaexecutor.cjs');

(async () => {
  const moduleFiles = {
    '/index.html': `<div id="chat"></div><link rel="stylesheet" href="/style.css"><script type="module" src="/main.js"></script>`,
    '/style.css': `#chat{color:blue;margin-left:1px}`,
    '/msg.js': `export const msg = "BH module";`,
    '/main.js': `import { msg } from '/msg.js'; chat.textContent = msg;`
  };
  const moduleSourceBytes = Buffer.byteLength(Object.values(moduleFiles).join(''));
  const moduleBinary = await MerkavaExecutor.compileToBinary({ files: moduleFiles, entry: '/index.html' }, { type: 'source' });
  const moduleRun = await MerkavaExecutor.executeBinary(moduleBinary);
  const moduleDocument = moduleRun.document || moduleRun.web.document;
  assert.strictEqual(moduleDocument.getElementById('chat').textContent, 'BH module');
  assert.strictEqual(moduleDocument.getElementById('chat').style.color, 'blue');

  const nodeFiles = {
    '/main.js': `const txt = api.fs.readFileSync('/data.txt', 'utf8'); api.fs.writeFileSync('/out.txt', txt + '!'); export const done = api.fs.readFileSync('/out.txt', 'utf8');`,
    '/data.txt': 'BH fs'
  };
  const nodeRun = await MerkavaExecutor.executeNodeFiles(nodeFiles, '/main.js');
  assert.strictEqual(nodeRun.ok, true);
  assert.strictEqual(nodeRun.exports.done, 'BH fs!');
  assert.strictEqual(nodeRun.files['/out.txt'], 'BH fs!');

  console.log(JSON.stringify({
    ok: true,
    moduleApp: {
      sourceBytes: moduleSourceBytes,
      compiledBytes: moduleBinary.length,
      savedBytes: moduleSourceBytes - moduleBinary.length,
      chatText: moduleDocument.getElementById('chat').textContent,
      style: moduleDocument.getElementById('chat').style
    },
    nodeFs: {
      done: nodeRun.exports.done,
      outFile: nodeRun.files['/out.txt']
    }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
