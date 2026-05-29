// B"H
const { simulate, b64json, requireTruth } = require('./.test-tunnel-simulate-runtime-helpers.cjs');

/**
 * Chapter 2: Four scrolls entered one flame.
 * This proves actions/actionsJson/browserActions/pageActions plus base64 forms
 * all enter the same Merkava-backed action grammar and return visible evidence.
 */
async function runVariant(name, payload) {
  const result = await simulate({
    html: '<!doctype html><title>Variants</title><input id="v"><button id="b">Go</button>',
    returnValues: JSON.stringify(['document.querySelector("#v").value', 'document.title']),
    ...payload
  });
  const evidence = {
    name,
    ok: result.ok,
    values: result.values,
    actions: result.interactionLog?.map(x => ({ action: x.action, ok: x.ok, value: x.value }))
  };
  console.log(JSON.stringify(evidence, null, 2));
  requireTruth(result.ok, `${name} result ok`, evidence);
  requireTruth(result.values?.['document.querySelector("#v").value'] === name, `${name} value`, evidence);
}

(async () => {
  await runVariant('actions', { actions: JSON.stringify([{ action: 'fill', selector: '#v', text: 'actions' }]) });
  await runVariant('actionsJson', { actionsJson: JSON.stringify([{ action: 'type', selector: '#v', text: 'actionsJson' }]) });
  await runVariant('browserActions64', { browserActions64: b64json([{ action: 'fill', selector: '#v', text: 'browserActions64' }]) });
  await runVariant('pageActions64', { pageActions64: b64json([{ action: 'fill', selector: '#v', text: 'pageActions64' }]) });
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
