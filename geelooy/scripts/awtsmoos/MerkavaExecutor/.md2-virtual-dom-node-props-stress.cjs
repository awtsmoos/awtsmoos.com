// B"H
'use strict';

const assert = require('assert');
const { encodeMode2JsBinary, runMode2JsBinary } = require('./merkava-binary/Mode2JsBinary.js');
const { SyntheticBrowserRuntime } = require('./merkava-browser/SyntheticBrowserRuntime.js');

(async () => {
  const browser = new SyntheticBrowserRuntime();
  const source = `
    let frag = document.createDocumentFragment();
    let a = document.createElement('input'); a.id = 'a'; a.setAttribute('type','checkbox'); a.setAttribute('checked','');
    let b = document.createElement('option'); b.id = 'b'; b.setAttribute('selected',''); b.setAttribute('data-seed','42');
    frag.appendChild(a); frag.appendChild(b); document.body.appendChild(frag);
    let c = document.createElement('div'); c.id = 'c'; document.body.insertBefore(c, b);
    let deep = document.body.cloneNode(true);
    a.click();
    __awtsmoosResult = {
      count: document.body.childElementCount,
      first: document.body.firstElementChild.id,
      prev: b.previousSibling.id,
      next: c.nextSibling.id,
      checkbox: a.checked,
      selected: b.selected,
      data: b.dataset.seed,
      attrFound: document.querySelector('option[data-seed="42"]').id,
      matches: b.matches('option[data-seed="42"]'),
      cloneCount: deep.childElementCount,
      cloneSecond: deep.children[1].id
    };
  `;
  const binary = await encodeMode2JsBinary(source);
  const run = runMode2JsBinary(binary, { globals: browser.globals() });
  assert.deepStrictEqual(run.result, { count: 3, first: 'a', prev: 'c', next: 'b', checkbox: false, selected: true, data: '42', attrFound: 'b', matches: true, cloneCount: 3, cloneSecond: 'c' });
  console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
