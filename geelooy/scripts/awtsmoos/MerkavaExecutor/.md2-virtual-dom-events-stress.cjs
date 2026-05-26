// B"H
'use strict';

const assert = require('assert');
const { encodeMode2JsBinary, runMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');
const { SyntheticBrowserRuntime } = require('./merkava-browser/SyntheticBrowserRuntime.js');

(async () => {
  const browser = new SyntheticBrowserRuntime();
  const source = `
    let log = [];
    let root = document.createElement('div'); root.id = 'root';
    let mid = document.createElement('section'); mid.id = 'mid';
    let input = document.createElement('input'); input.id = 'field'; input.setAttribute('tabindex', '0');
    root.appendChild(mid); mid.appendChild(input); document.body.appendChild(root);
    root.addEventListener('click', ev => log.push('root-capture:' + ev.eventPhase + ':' + ev.currentTarget.id), true);
    mid.addEventListener('click', ev => log.push('mid-capture:' + ev.composedPath().length), true);
    input.addEventListener('click', ev => log.push('target:' + ev.eventPhase + ':' + ev.target.id));
    mid.addEventListener('click', ev => log.push('mid-bubble:' + ev.currentTarget.id));
    root.addEventListener('click', ev => log.push('root-bubble:' + ev.currentTarget.id));
    input.addEventListener('focus', ev => log.push('focus:' + ev.type));
    input.addEventListener('blur', ev => log.push('blur:' + ev.type));
    input.addEventListener('input', ev => log.push('input:' + ev.data + ':' + input.value));
    input.addEventListener('keydown', ev => log.push('key:' + ev.key));
    input.addEventListener('click', ev => log.push('once'), { once: true });
    page.click('#field');
    page.click('#field');
    page.type('#field', 'ab');
    input.blur();
    __awtsmoosResult = { log, value: input.value, active: document.activeElement ? document.activeElement.id : null, contains: root.contains(input), first: root.firstChild.id, next: mid.nextSibling ? mid.nextSibling.id : null };
  `;
  const binary = await encodeMode2JsBinary(source);
  const run = runMode2JsBinary(binary, { globals: browser.globals() });
  assert.deepStrictEqual(run.result.value, 'ab');
  assert.strictEqual(run.result.active, null);
  assert.strictEqual(run.result.contains, true);
  assert.strictEqual(run.result.first, 'mid');
  assert.ok(run.result.log.includes('root-capture:1:root'));
  assert.ok(run.result.log.includes('target:2:field'));
  assert.ok(run.result.log.includes('mid-bubble:mid'));
  assert.strictEqual(run.result.log.filter(x => x === 'once').length, 1);
  assert.ok(run.result.log.includes('focus:focus'));
  assert.ok(run.result.log.includes('blur:blur'));
  assert.ok(run.result.log.includes('key:a'));
  assert.ok(run.result.log.includes('input:b:ab'));
  console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
