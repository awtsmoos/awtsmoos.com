// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');
const Priority = require('../lib/runtime/priority.js');

async function call(config, payload) {
  const actions = buildActions(config, payload, null);
  assert.equal(typeof actions[payload.action], 'function', 'missing action ' + payload.action);
  return await actions[payload.action]();
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-node-dom-actions-'));
  await fsp.writeFile(path.join(root, 'package.json'), JSON.stringify({ scripts: { test: 'node --test', build: 'vite build' } }, null, 2));
  await fsp.writeFile(path.join(root, 'ok.js'), 'const x = 1;\n');
  const config = { root, allowCommands: true, tools: { command: true, fsRead: true } };
  const html = '<main><button id="go">Go</button><input id="name"><script>window.clicked=0;document.querySelector("#go").addEventListener("click",()=>{window.clicked++});console.log("ready")</script></main>';

  const query = await call(config, { action: 'nodeDomQuery', html, selector: 'button' });
  assert.equal(query.ok, true);
  assert.equal(query.count, 1);
  assert.equal(query.items[0].id, 'go');

  const click = await call(config, { action: 'nodeDomClick', html, selector: '#go', returnValues: ['window.clicked'] });
  assert.equal(click.ok, true);
  assert.equal(click.runtime.values['window.clicked'], 1);

  const typed = await call(config, { action: 'nodeDomType', html, selector: '#name', text: 'abc', returnValues: ['document.querySelector("#name").value'] });
  assert.equal(typed.ok, true);
  assert.equal(typed.runtime.values['document.querySelector("#name").value'], 'abc');

  const evaled = await call(config, { action: 'nodeDomEval', html, expression: 'document.querySelector("#go").textContent' });
  assert.equal(evaled.ok, true);
  assert.equal(evaled.value, 'Go');

  const titled = await call(config, {
    action: 'nodeDomEval',
    html: '<!doctype html><html><head><title>Full &amp; Faithful</title></head><body><main>Body</main></body></html>',
    expression: 'document.title'
  });
  assert.equal(titled.ok, true);
  assert.equal(titled.value, 'Full & Faithful');

  const logs = await call(config, { action: 'nodeDomConsole', html });
  assert.equal(logs.ok, true);
  assert.ok(Array.isArray(logs.console));

  const diff = await call(config, { action: 'nodeDomDiff', leftHtml: '<p>A</p>', rightHtml: '<p>B</p>' });
  assert.equal(diff.ok, true);
  assert.equal(diff.changed, true);

  const scripts = await call(config, { action: 'nodePackageScripts', path: 'package.json' });
  assert.equal(scripts.ok, true);
  assert.equal(scripts.scripts.test, 'node --test');

  const check = await call(config, { action: 'isolatedNodeCheck', path: 'ok.js' });
  assert.equal(check.ok, true);

  assert.equal(Priority.laneForAction('nodeDomRun', 'fs'), Priority.LANES.P4);
  assert.equal(Priority.laneForAction('nodeVersionDoctor', 'fs'), Priority.LANES.P0);

  console.log(JSON.stringify({ ok: true, suite: 'node-dom-action-aliases' }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
