// B"H
'use strict';

const assert = require('assert');
const { encodeMode2JsBinary, runMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');
const { SyntheticBrowserRuntime } = require('./merkava-browser/SyntheticBrowserRuntime.js');

(async () => {
  const browser = new SyntheticBrowserRuntime();
  const source = `
    addStyleSheet('section > .direct { color: red; width: 12px; } .direct + .after { color: blue; height: 13px; } div .after { margin: 99px; }');
    let section = document.createElement('section');
    let direct = document.createElement('div'); direct.classList.add('direct'); direct.id = 'direct';
    let after = document.createElement('div'); after.classList.add('after'); after.id = 'after';
    let nested = document.createElement('div'); nested.classList.add('direct'); nested.id = 'nested';
    let wrap = document.createElement('article'); wrap.appendChild(nested);
    section.appendChild(direct); section.appendChild(after); section.appendChild(wrap); document.body.appendChild(section);
    let ds = getComputedStyle(direct);
    let as = getComputedStyle(after);
    let ns = getComputedStyle(nested);
    __awtsmoosResult = {
      directColor: ds.getPropertyValue('color'),
      directWidth: ds.getPropertyValue('width'),
      afterColor: as.getPropertyValue('color'),
      afterHeight: as.getPropertyValue('height'),
      afterMargin: as.getPropertyValue('margin') || '',
      nestedColor: ns.getPropertyValue('color') || ''
    };
  `;
  const binary = await encodeMode2JsBinary(source);
  const run = runMode2JsBinary(binary, { globals: browser.globals() });
  assert.deepStrictEqual(run.result, { directColor: 'red', directWidth: '12px', afterColor: 'blue', afterHeight: '13px', afterMargin: '', nestedColor: '' });
  console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
