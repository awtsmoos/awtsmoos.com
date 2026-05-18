const s = require('./merkava-service');

const files = JSON.stringify({
  's.js': 'let name = "Awtsmoos";\nconsole.log(name);'
});
const probes = JSON.stringify([{
  file: 's.js', line: 2, variable: 'name'
}]);
const workflow = JSON.stringify({
  if: {
    condition: { eq: [{ var: 'runtime' }, 'browser'] },
    then: { run: 'simulateBrowser' },
    else: { run: 'unsupportedRuntime' }
  }
});

(async () => {
  const basic = await s.simulateRuntime({ runtime: 'browser', entry: 's.js', files, probes });
  const flow = await s.runtimeWorkflow({ runtime: 'browser', entry: 's.js', files, probes, workflow });
  console.log(JSON.stringify({
    basic: { ok: basic.ok, score: basic.score, snaps: basic.variableSnapshots, logs: basic.console?.logs || basic.console },
    flow: { ok: flow.ok, score: flow.score, snaps: flow.variableSnapshots }
  }, null, 2));
})().catch(e => {
  console.error(e.stack || e.message);
  process.exit(1);
});
