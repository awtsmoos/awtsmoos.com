// B"H
'use strict';

const assert = require('assert');
const { encodeMode2JsBinary, runMode2JsBinary, isMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');
const { SyntheticBrowserRuntime } = require('./merkava-browser/SyntheticBrowserRuntime.js');

(async () => {
  const browser = new SyntheticBrowserRuntime();
  const source = `
    let font = registerFont('user-provided-later', [1,2,3,4], { source: 'test-bytes' });
    let font = registerFont('user-provided-later', [1,2,3,4], { source: 'test-bytes' });
    let box = document.createElement('div');
    box.textContent = 'Awtsmoos';
    box.setAttribute('style', 'width: 80px; height: 24px; background-color: purple; color: white');
    document.body.appendChild(box);
    let a = document.createElement('canvas');
    a.width = 64; a.height = 32;
    document.body.appendChild(a);
    let c2 = a.getContext('2d');
    c2.fillStyle = 'orange';
    c2.fillRect(0, 0, 16, 16);
    c2.fillText('BH', 4, 12);
    let b = document.createElement('canvas');
    b.width = 32; b.height = 32;
    document.body.appendChild(b);
    let c3 = b.getContext('2d');
    c3.drawImage(a, 0, 0, 32, 16);
    let gl = b.getContext('webgl');
    gl.viewport(0, 0, 32, 32);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let snap = renderWebGLDom();
    __awtsmoosResult = {
      textures: snap.textures.length,
      hasBox: snap.commands.some(x => x.op === 'paintBox'),
      has2d: snap.commands.some(x => x.op === 'fillRect'),
      hasText: snap.commands.some(x => x.op === 'fillTextPlaceholder' || x.op === 'paintTextPlaceholder'),
      hasDrawImage: snap.commands.some(x => x.op === 'drawImageTexture'),
      hasWebgl: snap.commands.some(x => x.op === 'webgl.clear'),
      fontBytes: font.bytes
    };
  `;
  const binary = await encodeMode2JsBinary(source);
  assert.ok(isMode2JsBinary(binary));
  const run = runMode2JsBinary(binary, { globals: browser.globals() });
  assert.ok(run.result.textures >= 6, 'expected DOM/canvas/WebGL textures');
  assert.strictEqual(run.result.hasBox, true);
  assert.strictEqual(run.result.has2d, true);
  assert.strictEqual(run.result.hasText, true);
  assert.strictEqual(run.result.hasDrawImage, true);
  assert.strictEqual(run.result.hasWebgl, true);
  assert.strictEqual(run.result.fontBytes, 4);
  assert.strictEqual(run.result.fontBytes, 4);
  console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
