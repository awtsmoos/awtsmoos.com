// B"H
'use strict';

const assert = require('assert');
const { encodeMode2JsBinary, runMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');
const { SyntheticBrowserRuntime } = require('./merkava-browser/SyntheticBrowserRuntime.js');

(async () => {
  const browser = new SyntheticBrowserRuntime();
  const source = `
    let log = [];
    let outer = document.createElement('div'); outer.id = 'outer';
    let inner = document.createElement('button'); inner.id = 'inner';
    outer.appendChild(inner); document.body.appendChild(outer);
    outer.addEventListener('mousedown', ev => log.push('outer-capture'), true);
    outer.addEventListener('mousedown', ev => log.push('outer-bubble'));
    inner.addEventListener('mousedown', ev => { log.push('inner-target:' + ev.clientX + ':' + ev.clientY); ev.preventDefault(); ev.stopPropagation(); });
    mouse.move(7, 9, inner); let ev = mouse.down(); mouse.up();
    __awtsmoosResult = { log, defaultPrevented: ev.defaultPrevented, buttons: mouse.buttons, history: mouse.history.map(x => x.type).join(',') };
  `;
  const binary = await encodeMode2JsBinary(source);
  const run = runMode2JsBinary(binary, { globals: browser.globals() });
  assert.deepStrictEqual(run.result.log, ['outer-capture', 'inner-target:7:9']);
  assert.strictEqual(run.result.defaultPrevented, true);
  assert.strictEqual(run.result.buttons, 0);
  assert.strictEqual(run.result.history, 'mousemove,mousedown,mouseup');
  console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
