// B"H
'use strict';

const assert = require('assert');
const { encodeMode2JsBinary, runMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');
const { SyntheticBrowserRuntime } = require('./merkava-browser/SyntheticBrowserRuntime.js');

(async () => {
  const browser = new SyntheticBrowserRuntime();
  const source = `
    addStyleSheet('div { width: 10px; height: 11px; background-color: red; color: black; padding: 1px; } .card { width: 20px; margin: 3px; } #hero { background-color: blue; border-width: 2px; }');
    let el = document.createElement('div');
    el.id = 'hero';
    el.classList.add('card');
    el.textContent = 'CSS';
    document.body.appendChild(el);
    let cs = getComputedStyle(el);
    let snap = renderWebGLDom();
    let heroPaint = snap.commands.filter(x => x.op === 'paintBox' && x.background === 'blue').pop();
    __awtsmoosResult = {
      width: cs.getPropertyValue('width'),
      background: cs.getPropertyValue('background-color'),
      color: cs.getPropertyValue('color'),
      margin: cs.getPropertyValue('margin'),
      padding: cs.getPropertyValue('padding'),
      border: cs.getPropertyValue('border-width'),
      paintedWidth: heroPaint.width,
      paintedBackground: heroPaint.background,
      paintedPadding: heroPaint.padding,
      paintedBorder: heroPaint.border,
      hasText: snap.commands.some(x => x.op === 'paintTextPlaceholder' && x.text === 'CSS')
    };
  `;
  const binary = await encodeMode2JsBinary(source);
  const run = runMode2JsBinary(binary, { globals: browser.globals() });
  assert.deepStrictEqual(run.result, {
    width: '20px',
    background: 'blue',
    color: 'black',
    margin: '3px',
    padding: '1px',
    border: '2px',
    paintedWidth: 20,
    paintedBackground: 'blue',
    paintedPadding: 1,
    paintedBorder: 2,
    hasText: true
  });
  console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
