// B"H
'use strict';

const assert = require('assert');
const { encodeMode2JsBinary, runMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');
const { SyntheticBrowserRuntime } = require('./merkava-browser/SyntheticBrowserRuntime.js');

(async () => {
  const browser = new SyntheticBrowserRuntime();
  const source = `
    setTextMeasureHook(function(text, font){ return { width: text.length * 11 + font.length, actualBoundingBoxAscent: 9, actualBoundingBoxDescent: 3, source: 'test-offscreen-hook' }; });
    let canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    ctx.font = '12px serif';
    let m = ctx.measureText('BH');
    ctx.fillText('BH', 1, 2);
    let snap = renderWebGLDom();
    __awtsmoosResult = { width: m.width, ascent: m.actualBoundingBoxAscent, source: m.source, textRuns: document.fontAtlas.snapshot().textRuns.length, hasFillText: snap.commands.some(x => x.op === 'fillTextPlaceholder') };
  `;
  const binary = await encodeMode2JsBinary(source);
  const run = runMode2JsBinary(binary, { globals: browser.globals() });
  assert.deepStrictEqual(run.result, { width: 32, ascent: 9, source: 'test-offscreen-hook', textRuns: 1, hasFillText: true });
  console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
