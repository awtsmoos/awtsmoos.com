// B"H
const { handleFsAction } = require('../geelooy/apps/tunnel/agent/tools/fs/actions.js');

(async () => {
  const result = await handleFsAction({
    action: 'simulateRuntime',
    engine: 'merkava',
    runtime: 'browser',
    entry: 'index.html',
    files: {
      'index.html': '<main id="root">Merkava source smoke</main>'
    },
    probes: [{ selector: '#root', textIncludes: 'Merkava' }],
    timeoutMs: 30000
  }, {});

  console.log(JSON.stringify({
    ok: result.ok,
    error: result.error,
    message: result.message,
    virtualFiles: Object.keys(result.virtualEnv?.files || {}),
    optionFiles: Object.keys(result.options?.files || {})
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
