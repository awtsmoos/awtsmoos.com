// B"H
const { buildRuntimeActions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js');
const { bulkSearch } = require('../../geelooy/apps/tunnel/agent/tools/fs/pagedSearch.js');
const { readManyLines } = require('../../geelooy/apps/tunnel/agent/tools/fs/lineBatch.js');
const { buildActions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actions.js');

const config = { root: process.cwd(), allowWrite: false, allowSecrets: true, tools: { fsRead: true, fsBulk: true, fsList: true, fsWrite: false } };

async function runtimeNodeDom() {
  const payload = {
    action: 'simulateRuntime', engine: 'node-dom', entry: 'index.html',
    html: '<body><input id="x"><button id="b">Go</button><div id="out"></div><script>document.getElementById("b").onclick=()=>document.getElementById("out").textContent=document.getElementById("x").value;</script></body>',
    actionsJson: JSON.stringify([{ action: 'fill', selector: '#x', value: 'BH' }, { action: 'click', selector: '#b' }, { action: 'assertText', selector: '#out', text: 'BH' }]),
    returnValues: JSON.stringify(['document.getElementById("out").textContent'])
  };
  return await buildRuntimeActions({ payload, config }).simulateRuntime();
}

async function searchPages() {
  const first = await bulkSearch(config, { p: 'geelooy/apps/tunnel/agent/tools/fs', query: 'function', maxFiles: 2, pageSize: 2, maxResults: 5 });
  const next = first.nextRequest ? await bulkSearch(config, first.nextRequest) : null;
  return { first, next };
}

async function linesCarrierCurrent() {
  const ranges = [{ path: 'geelooy/apps/tunnel/agent/tools/fs/actionBatch.js', startLine: 1, endLine: 3 }];
  return await readManyLines(config, { content: JSON.stringify({ ranges }) });
}

async function commandTreeContentLiveModule() {
  const payload = { action: 'commandTreeValidate', content: JSON.stringify({ steps: [{ action: 'stat', payload: { path: 'geelooy/apps/tunnel/agent/main.js' } }] }) };
  return await buildActions(config, payload, null).commandTreeValidate();
}

(async () => {
  const runtime = await runtimeNodeDom();
  const search = await searchPages();
  const lines = await linesCarrierCurrent();
  const tree = await commandTreeContentLiveModule();
  console.log(JSON.stringify({
    runtime: { ok: runtime.ok, engine: runtime.engine, errors: runtime.errors && runtime.errors.length, values: runtime.values },
    search: { firstReturned: search.first.returnedResults, firstPartial: search.first.partial, hasNext: !!search.first.nextRequest, nextReturned: search.next && search.next.returnedResults },
    lines: { ok: lines.ok, error: lines.error, count: lines.count },
    tree: { ok: tree.ok, plan: tree.plan && tree.plan.length }
  }, null, 2));
  if (!runtime.ok || runtime.engine !== 'node-dom') process.exit(2);
  if (!search.first.nextRequest || !search.next) process.exit(3);
  if (tree.ok !== true || tree.plan.length !== 1) process.exit(4);
  if (lines.ok !== false || lines.error !== 'missing_ranges') process.exit(5);
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
