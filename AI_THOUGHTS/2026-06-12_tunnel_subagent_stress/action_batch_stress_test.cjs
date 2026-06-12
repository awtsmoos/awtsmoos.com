// B"H
const path = require('path');
const home = process.env.USERPROFILE || process.env.HOME;
const installed = path.join(home, '.awtsmoos-tunnel', 'tools', 'fs', 'actionBatch.js');
const { runActionBatch, normalizeSteps, fusePayload } = require(installed);

async function fakeRun(payload) {
  if (payload.action === 'echo') return { ok: true, echo: payload };
  if (payload.action === 'fail') return { ok: false, error: 'forced' };
  return { ok: true, action: payload.action, payload };
}

function baseTree(extraSteps = []) {
  return {
    vars: { prefix: 'BH' },
    steps: [
      { action: 'echo', payload: { text: '$vars.prefix-start' }, saveAs: 'first' },
      { forEach: { items: ['A', 'B'], as: 'item', do: [{ action: 'echo', payload: { text: '$vars.prefix:$vars.item:$vars.index' } }] } },
      { if: { path: 'last.ok', eq: true }, then: [{ action: 'echo', payload: { text: 'condition-ok' } }] },
      ...extraSteps
    ],
    finally: [{ action: 'echo', payload: { text: 'finally' } }],
    maxInlineBytes: 20000
  };
}

async function main() {
  const greenTree = baseTree([{ assert: { path: 'last.ok', eq: true } }]);
  const errorTree = baseTree([{ action: 'fail', stopOnError: false, onError: [{ action: 'echo', payload: { text: 'recovered' } }] }]);
  const contentPayload = { action: 'commandTreeRun', content: JSON.stringify(greenTree) };
  const paramsPayload = { action: 'actionBatch', params: greenTree };
  const b64Payload = { action: 'actionBatch', workflow64: Buffer.from(JSON.stringify(greenTree)).toString('base64') };
  const dry = await runActionBatch({ action: 'commandTreeDryRun', content: JSON.stringify(greenTree), dryRun: true }, fakeRun);
  const a = await runActionBatch(contentPayload, fakeRun);
  const b = await runActionBatch(paramsPayload, fakeRun);
  const c = await runActionBatch(b64Payload, fakeRun);
  const handled = await runActionBatch({ action: 'actionBatch', content: JSON.stringify(errorTree) }, fakeRun);
  console.log(JSON.stringify({
    normalizedContent: normalizeSteps(contentPayload).length,
    normalizedParams: normalizeSteps(paramsPayload).length,
    normalizedB64: normalizeSteps(b64Payload).length,
    fusedHasSteps: Array.isArray(fusePayload(contentPayload).steps),
    dryPlan: dry.plan.length,
    greenCounts: [a.count, b.count, c.count],
    greenOk: [a.ok, b.ok, c.ok],
    handled: { ok: handled.ok, count: handled.count, recovered: JSON.stringify(handled.results).includes('recovered') }
  }, null, 2));
  if (normalizeSteps(contentPayload).length !== 4) process.exit(2);
  if (normalizeSteps(paramsPayload).length !== 4) process.exit(3);
  if (normalizeSteps(b64Payload).length !== 4) process.exit(4);
  if (dry.plan.length !== 4) process.exit(5);
  if (!a.ok || !b.ok || !c.ok) process.exit(6);
  if (a.count < 6 || b.count < 6 || c.count < 6) process.exit(7);
  if (handled.ok !== false || !JSON.stringify(handled.results).includes('recovered')) process.exit(8);
}
main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
