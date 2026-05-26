// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const html = `<awts-card id="card1" awts-mode="spark" data-blessing="hi there">hi there</awts-card>
<awts-card id="card2" awts-mode="spark" data-blessing="hi there">hi there</awts-card>`;
  const bin = await M.compileToBinary({ files: { '/index.html': html }, entry: '/index.html' }, { type: 'source', format: 'mapp' });
  const app = M.decodeUnifiedApp(bin);
  const web = M.decodeWebBinary(app.webBinary);
  const customWebPool = web.pool;
  assert.strictEqual(customWebPool.filter(x => x === 'awts-card').length, 1);
  assert.strictEqual(customWebPool.filter(x => x === 'awts-mode').length, 1);
  assert.strictEqual(customWebPool.filter(x => x === 'spark').length, 1);
  assert.strictEqual(customWebPool.filter(x => x === 'hi there').length, 1);
  const run = await M.executeBinary(bin);
  assert.strictEqual(run.web.document.getElementById('card1').tagName, 'AWTS-CARD');
  assert.strictEqual(run.web.document.getElementById('card2').dataset.blessing, 'hi there');

  const classes = `
class One { hiThere(){ return 'hi there'; } }
class Two { hiThere(){ return 'hi there'; } }`;
  const cbin = await M.compileToBinary(classes, { type: 'js', scopeName: 'custom-classes' });
  const decoded = M.decodeCompactClassBinary(cbin);
  assert.strictEqual(decoded.pool.filter(x => x === 'hiThere').length, 1);
  assert.strictEqual(decoded.pool.filter(x => x === 'hi there').length, 1);

  console.log(JSON.stringify({
    ok: true,
    customHtmlPool: customWebPool,
    customHtmlPoolBytesOnce: {
      tagOccurrences: customWebPool.filter(x => x === 'awts-card').length,
      attrOccurrences: customWebPool.filter(x => x === 'awts-mode').length,
      valueOccurrences: customWebPool.filter(x => x === 'hi there').length
    },
    classPool: decoded.pool,
    webBytes: bin.length,
    classBytes: cbin.length
  }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
