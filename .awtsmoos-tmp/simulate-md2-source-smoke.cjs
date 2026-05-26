// B"H
const { handleFsAction } = require('../geelooy/apps/tunnel/agent/tools/fs/actions.js');

(async () => {
  const result = await handleFsAction({
    action: 'simulateRuntime',
    engine: 'md2',
    runtime: 'browser',
    entry: 'index.html',
    files: {
      'index.html': '<main id="out"></main><script>const msg="BH Tunnel MD2"; out.textContent=msg;</script>'
    },
    timeoutMs: 30000
  }, {});

  console.log(JSON.stringify({
    ok: result.ok,
    engine: result.engine,
    bytecodeBytes: result.bytecode && result.bytecode.bytes,
    resultOk: result.result && result.result.ok,
    error: result.error,
    message: result.message
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
