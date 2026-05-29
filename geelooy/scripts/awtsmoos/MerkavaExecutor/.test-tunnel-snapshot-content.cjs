// B"H
const { simulate, requireTruth } = require('./.test-tunnel-simulate-runtime-helpers.cjs');

/**
 * Chapter 6: The snapshot saw the serpent bite its own tail and did not break.
 * setContent, locator freshness after mutation, screenshot, snapshot, content,
 * url/title assertions all produce serializable evidence from Merkava alone.
 */
(async () => {
  const actions = [
    { action: 'setContent', html: '<title>Changed</title><section id="box"><span class="item">old</span></section>' },
    { action: 'locator', selector: '.item' },
    { action: 'evaluate', source: 'document.querySelector(".item").textContent = "new"' },
    { action: 'locator', selector: '.item' },
    { action: 'assertText', selector: '.item', expected: 'new' },
    { action: 'title' },
    { action: 'content' },
    { action: 'screenshot' },
    { action: 'snapshot' },
    { action: 'goto', url: '/next-path' },
    { action: 'reload' },
    { action: 'url' },
    { action: 'assertUrl', expected: '/next-path' }
  ];
  const result = await simulate({
    html: '<!doctype html><title>Original</title><main>before</main>',
    actionsJson: JSON.stringify(actions),
    returnValues: JSON.stringify(['document.title', 'document.querySelector(".item").textContent', 'window.location.href'])
  });
  const log = result.interactionLog || [];
  const evidence = {
    ok: result.ok,
    values: result.values,
    locatorValues: log.filter(x => x.action === 'locator').map(x => x.value),
    contentLength: log.find(x => x.action === 'content')?.value?.length,
    screenshotKind: typeof log.find(x => x.action === 'screenshot')?.value,
    snapshotKind: typeof log.find(x => x.action === 'snapshot')?.value,
    urlValue: log.find(x => x.action === 'url')?.value,
    errors: log.filter(x => !x.ok).map(x => x.error)
  };
  console.log(JSON.stringify(evidence, null, 2));
  requireTruth(result.ok, 'snapshot/content actions ok', evidence);
  requireTruth(result.values?.['document.title'] === 'Changed', 'title changed', evidence);
  requireTruth(result.values?.['document.querySelector(".item").textContent'] === 'new', 'mutated locator target', evidence);
  requireTruth(String(result.values?.['window.location.href']).includes('/next-path'), 'goto url value', evidence);
  requireTruth(evidence.locatorValues?.[1]?.element?.textContent === 'new', 'fresh locator after mutation', evidence);
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
