// B"H
const { handleFsAction } = require(process.cwd() + '/geelooy/apps/tunnel/agent/tools/fs/actions.js');
const target = process.argv[2];
let wrote = false;
const keepAlive = setTimeout(() => emit({ p: target, ok: false, engine: 'merkava', error: 'child_internal_timeout' }), 15000);
function emit(row) {
  if (wrote) return;
  wrote = true;
  clearTimeout(keepAlive);
  console.log(JSON.stringify(row));
  process.exit(0);
}
Promise.resolve()
  .then(() => handleFsAction({
    action: 'simulateRuntime',
    p: target,
    timeoutMs: 9000,
    waitMs: 120,
    returnValues: ['document.title', 'document.body ? document.body.children.length : -1', 'document.querySelectorAll("script").length']
  }, null))
  .then(r => {
    const err = (r.errors || [])[0];
    emit({
      p: target,
      ok: !!r.ok,
      engine: r.engine || 'merkava',
      error: r.error || err?.message || null,
      stack: err?.stack ? String(err.stack).split('\n').slice(0, 8).join('\n') : null,
      values: r.values || r.result?.values || null,
      epochs: r.epochs || null
    });
  })
  .catch(error => emit({ p: target, ok: false, engine: 'merkava', error: error.message, stack: error.stack ? String(error.stack).split('\n').slice(0, 10).join('\n') : null }));
