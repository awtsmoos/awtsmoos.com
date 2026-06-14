// B"H
const assert = require("assert");
const path = require("path");
const { simulateNodeDomRuntime } = require(path.join(__dirname, "../nodeDomRuntime/index.js"));

/**
 * B"H
 * Chapter 423: Twenty-Five Gates Of The Living DOM.
 *
 * This scroll refuses a static dream. Each test makes JavaScript disturb the
 * world: events, modules, timers, fragments, datasets, forms, storage, fetch,
 * and strange missing paths. The virtual DOM must remember what happened.
 */
const cases = [];
function test(name, options, assertCase) { cases.push({ name, options, assertCase }); }
function html(body, script) { return `<!doctype html><html><head><title>seed</title></head><body>${body}<script>${script}</script></body></html>`; }
function mod(body, script) { return `<!doctype html><html><body>${body}<script type="module">${script}</script></body></html>`; }
function includes(value, needle) { assert.ok(JSON.stringify(value || "").includes(needle), `missing ${needle}`); }

test("append-created-node", { html: html(`<div id="root"></div>`, `const p=document.createElement('p'); p.id='made'; p.textContent='alpha'; root.append(p);`), returnValues: ["made.textContent", "document.body.innerHTML"] }, r => {
  assert.equal(r.values["made.textContent"], "alpha"); includes(r.domSnapshot, "alpha");
});

test("prepend-and-order", { html: html(`<ul id="list"><li>B</li></ul>`, `const li=document.createElement('li'); li.textContent='A'; list.prepend(li);`), returnValues: ["list.textContent"] }, r => assert.equal(r.values["list.textContent"], "AB"));

test("replace-children", { html: html(`<div id="box"><i>old</i></div>`, `box.replaceChildren('new ', document.createElement('b')); box.querySelector('b').textContent='bold';`), returnValues: ["box.textContent", "box.innerHTML"] }, r => {
  assert.equal(r.values["box.textContent"], "new bold"); includes(r.values, "bold");
});

test("remove-node", { html: html(`<div><span id="bye">bye</span><span id="stay">stay</span></div>`, `bye.remove();`), returnValues: ["!!document.querySelector('#bye')", "stay.textContent"] }, r => {
  assert.equal(r.values["!!document.querySelector('#bye')"], false); assert.equal(r.values["stay.textContent"], "stay");
});

test("classlist-dataset-attributes", { html: html(`<div id="card"></div>`, `card.classList.add('hot','ready'); card.dataset.kind='spark'; card.setAttribute('aria-live','polite');`), returnValues: ["card.className", "card.dataset.kind", "card.getAttribute('aria-live')"] }, r => {
  assert.equal(r.values["card.dataset.kind"], "spark"); includes(r.values["card.className"], "hot"); assert.equal(r.values["card.getAttribute('aria-live')"], "polite");
});

test("style-mutation", { html: html(`<div id="box"></div>`, `box.style.width='123px'; box.style.backgroundColor='red';`), returnValues: ["box.style.width", "box.style.backgroundColor"] }, r => {
  assert.equal(r.values["box.style.width"], "123px"); assert.ok(r.values["box.style.backgroundColor"]);
});

test("click-event", { html: html(`<button id="btn">go</button><output id="out"></output>`, `btn.addEventListener('click',()=>out.textContent='clicked');`), browserActions: [{ action: "click", selector: "#btn" }], returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "clicked"));

test("delegated-event", { html: html(`<section id="wrap"><button id="child">tap</button></section><output id="out"></output>`, `wrap.addEventListener('click',e=>{ if(e.target.id==='child') out.textContent='delegated'; });`), browserActions: [{ action: "click", selector: "#child" }], returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "delegated"));

test("input-fill-event", { html: html(`<input id="name"><output id="out"></output>`, `name.addEventListener('input',()=>out.textContent=name.value.toUpperCase());`), browserActions: [{ action: "fill", selector: "#name", value: "awts" }], returnValues: ["name.value", "out.textContent"] }, r => {
  assert.equal(r.values["name.value"], "awts"); assert.equal(r.values["out.textContent"], "AWTS");
});

test("keyboard-type-event", { html: html(`<input id="name"><output id="out"></output>`, `name.addEventListener('input',()=>out.textContent=name.value);`), browserActions: [{ action: "type", selector: "#name", text: "abc" }], returnValues: ["name.value", "out.textContent"] }, r => {
  assert.equal(r.values["name.value"], "abc"); assert.equal(r.values["out.textContent"], "abc");
});

test("microtask-dom", { html: html(`<div id="out"></div>`, `Promise.resolve().then(()=>out.textContent='micro');`), waitMs: 20, returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "micro"));

test("timeout-dom", { html: html(`<div id="out"></div>`, `setTimeout(()=>out.textContent='timer',5);`), waitMs: 30, returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "timer"));

test("interval-dom", { html: html(`<div id="out"></div>`, `let n=0; const t=setInterval(()=>{out.textContent=String(++n); if(n===2) clearInterval(t);},5);`), waitMs: 40, returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "2"));

test("inline-module-await", { html: mod(`<div id="out"></div>`, `await Promise.resolve(); out.textContent='awaited'; console.log('module awaited');`), waitMs: 20, returnValues: ["out.textContent"] }, r => {
  assert.equal(r.values["out.textContent"], "awaited"); includes(r.console, "module awaited");
});

test("external-module-import", { entry: "index.html", files: { "index.html": `<body><div id="out"></div><script type="module" src="app.js"></script></body>`, "app.js": `import { word } from './dep.js'; out.textContent=word;`, "dep.js": `export const word='imported';` }, returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "imported"));

test("dynamic-import", { entry: "index.html", files: { "index.html": `<body><div id="out"></div><script type="module">const m=await import('./dyn.js'); out.textContent=m.dyn;</script></body>`, "dyn.js": `export const dyn='dynamic';` }, waitMs: 20, returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "dynamic"));

test("template-clone", { html: html(`<template id="tpl"><span class="x">T</span></template><div id="root"></div>`, `root.append(tpl.content.cloneNode(true)); root.querySelector('.x').textContent='cloned';`), returnValues: ["root.textContent", "!!root.querySelector('.x')"] }, r => {
  assert.equal(r.values["root.textContent"], "cloned"); assert.equal(r.values["!!root.querySelector('.x')"], true);
});

test("document-fragment", { html: html(`<ul id="list"></ul>`, `const f=document.createDocumentFragment(); ['a','b','c'].forEach(x=>{const li=document.createElement('li'); li.textContent=x; f.append(li);}); list.append(f);`), returnValues: ["list.children.length", "list.textContent"] }, r => {
  assert.equal(r.values["list.children.length"], 3); assert.equal(r.values["list.textContent"], "abc");
});

test("custom-event", { html: html(`<div id="box"></div>`, `box.addEventListener('ignite',e=>box.textContent=e.detail.word); box.dispatchEvent(new CustomEvent('ignite',{detail:{word:'custom'}}));`), returnValues: ["box.textContent"] }, r => assert.equal(r.values["box.textContent"], "custom"));

test("select-change", { html: html(`<select id="sel"><option>a</option><option value="b">B</option></select><output id="out"></output>`, `sel.addEventListener('change',()=>out.textContent=sel.value); sel.value='b'; sel.dispatchEvent(new Event('change'));`), returnValues: ["sel.value", "out.textContent"] }, r => {
  assert.equal(r.values["sel.value"], "b"); assert.equal(r.values["out.textContent"], "b");
});

test("checkbox-change", { html: html(`<input id="ck" type="checkbox"><output id="out"></output>`, `ck.addEventListener('change',()=>out.textContent=String(ck.checked)); ck.checked=true; ck.dispatchEvent(new Event('change'));`), returnValues: ["ck.checked", "out.textContent"] }, r => {
  assert.equal(r.values["ck.checked"], true); assert.equal(r.values["out.textContent"], "true");
});

test("local-session-storage", { html: html(`<div id="out"></div>`, `localStorage.setItem('a','1'); sessionStorage.setItem('b','2'); out.textContent=localStorage.getItem('a')+sessionStorage.getItem('b');`), returnValues: ["out.textContent", "localStorage.getItem('a')", "sessionStorage.getItem('b')"] }, r => {
  assert.equal(r.values["out.textContent"], "12"); assert.equal(r.values["localStorage.getItem('a')"], "1");
});

test("virtual-fetch-json", { entry: "index.html", files: { "index.html": `<body><div id="out"></div><script type="module">const r=await fetch('/data.json'); const j=await r.json(); out.textContent=j.name;</script></body>`, "data.json": `{"name":"fetched"}` }, waitMs: 20, returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "fetched"));

test("canvas-command-recorder", { html: html(`<canvas id="c"></canvas><div id="out"></div>`, `const ctx=c.getContext('2d'); ctx.fillRect(1,2,3,4); out.textContent=ctx ? 'canvas' : 'none';`), returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "canvas"));

test("missing-query-safe", { html: html(`<div id="out"></div>`, `const missing=document.querySelector('.nope'); out.textContent=missing ? 'bad' : 'safe';`), returnValues: ["out.textContent", "document.querySelector('.nope')"] }, r => {
  assert.equal(r.values["out.textContent"], "safe"); assert.equal(r.values["document.querySelector('.nope')"], null);
});

test("innerhtml-reparse", { html: html(`<div id="box"></div>`, `box.innerHTML='<article><h2 id="h">Hello</h2></article>';`), returnValues: ["document.querySelector('#h').textContent", "box.children.length"] }, r => {
  assert.equal(r.values["document.querySelector('#h').textContent"], "Hello"); assert.equal(r.values["box.children.length"], 1);
});

test("closest-matches", { html: html(`<section class="wrap"><button id="btn"><span id="inner">x</span></button></section><div id="out"></div>`, `out.textContent=inner.closest('.wrap').className + ':' + btn.matches('button');`), returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "wrap:true"));

test("nested-async-dom-chain", { html: html(`<div id="out"></div>`, `Promise.resolve().then(()=>setTimeout(()=>{const s=document.createElement('span'); s.textContent='chain'; out.append(s);},5));`), waitMs: 40, returnValues: ["out.textContent"] }, r => assert.equal(r.values["out.textContent"], "chain"));

(async () => {
  const failures = [];
  const summaries = [];
  for (const item of cases) {
    const options = { waitMs: 0, returnValues: [], ...item.options };
    const result = await simulateNodeDomRuntime(options);
    try {
      item.assertCase(result);
      summaries.push({ name: item.name, ok: result.ok, score: result.score, consoleCount: result.console?.logs?.length || 0, errors: (result.errors || []).map(e => e.message) });
    } catch (error) {
      failures.push({ name: item.name, assertion: error.message, result: { ok: result.ok, score: result.score, errors: result.errors, values: result.values, console: result.console } });
    }
  }
  const report = { ok: failures.length === 0, total: cases.length, passed: cases.length - failures.length, failures, summaries };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exit(1);
})();
