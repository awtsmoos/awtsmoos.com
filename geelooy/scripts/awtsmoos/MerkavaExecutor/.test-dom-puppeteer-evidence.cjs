// B"H
/**
 * Evidence harness: prints concrete DOM handles, mutation records, action
 * errors, page values, returnValues, and scoped probes with a circular-safe
 * serializer so failures remain inspectable instead of becoming print errors.
 */
function safeStringify(value) {
  const seen = new WeakSet();
  return JSON.stringify(value, (key, got) => {
    if (typeof got === 'object' && got !== null) {
      if (seen.has(got)) return '[Circular]';
      seen.add(got);
    }
    if (typeof got === 'function') return `[Function ${got.name || 'anonymous'}]`;
    return got;
  }, 2);
}

(async () => {
  const m = await import('./merkava-service/index.js');
  const source = `
const topValue = 41;
function build(){
  const localSecret = 'inner-fire';
  const count = 2;
  const wrap = document.createElement('section');
  wrap.id = 'wrap';
  wrap.className = 'zone';
  const item = document.createElement('button');
  item.id = 'item';
  item.className = 'entry primary';
  item.textContent = localSecret + ':' + count;
  item.setAttribute('data-role', 'cta');
  wrap.appendChild(item);
  document.body.appendChild(wrap);
  window.scopeEcho = localSecret + '/' + count;
}
build();
const mutations = [];
const mo = new MutationObserver(records => mutations.push(...records.map(r => r.kind + ':' + r.target.id)));
mo.observe(document.body, { childList: true, subtree: true, attributes: true });
const extra = document.createElement('span');
extra.className = 'entry secondary';
extra.textContent = 'secondary';
document.querySelector('#wrap').appendChild(extra);
window.mutationEvidence = mutations;
window.closestEvidence = document.querySelector('#item').closest('section').id;
window.matchesEvidence = document.querySelector('#item').matches('button.primary[data-role="cta"]');
`;
  const actions = [
    { action: 'waitForSelector', selector: '#item', timeoutMs: 50 },
    { action: '$', selector: '#item' },
    { action: '$$', selector: '.entry' },
    { action: 'locator', selector: '#item' },
    { action: 'evaluate', source: 'document.querySelector("#item").closest("section").id' },
    { action: 'title' },
    { action: 'url' },
    { action: 'content' },
    { action: 'click', selector: '#missing', continueOnError: true }
  ];
  const result = await m.simulateRuntime({
    files: { 'index.html': '<title>Merkava DOM Evidence</title><script type="module" src="./index.js"></script>', 'index.js': source },
    entry: 'index.html',
    waitMs: 150,
    interactions: actions,
    returnValues: [
      'window.scopeEcho',
      'window.closestEvidence',
      'window.matchesEvidence',
      'window.mutationEvidence.length',
      'document.querySelector("#item").textContent',
      'document.querySelectorAll(".entry").length',
      'crypto.randomUUID().length',
      'structuredClone({a:1}).a'
    ],
    probes: [
      { file: 'index.js', line: 5, variable: 'localSecret' },
      { file: 'index.js', line: 6, variable: 'count' }
    ]
  });
  const evidence = {
    ok: result.ok,
    actionCount: result.interactionLog?.length || 0,
    actionErrors: (result.interactionLog || []).filter(x => x.ok === false).map(x => ({ id: x.id, action: x.action, error: x.error, hasStack: !!x.stack, continueOnError: x.continueOnError })),
    handles: (result.interactionLog || []).filter(x => x.action === '$' || x.action === '$$' || x.action === 'locator').map(x => x.value),
    values: result.values,
    valueErrors: result.valueErrors,
    probes: result.variableSnapshots,
    domJournalTail: result.domSnapshot?.journal?.slice(-5),
    errors: result.errors?.map(e => ({ message: e.message, code: e.code || null, hasStack: !!e.stack }))
  };
  console.log(safeStringify(evidence));
  const failures = [];
  if (!result.ok) failures.push('runtime not ok');
  if (!evidence.actionErrors.some(x => /Missing selector|No element for mouse/.test(x.error))) failures.push('missing-selector error not preserved');
  if (!evidence.handles[0]?.nodeId) failures.push('single element handle missing nodeId');
  if (!Array.isArray(evidence.handles[1]) || evidence.handles[1].length !== 2) failures.push('multi handle count wrong');
  if (result.values['window.closestEvidence'] !== 'wrap') failures.push('closest value wrong');
  if (result.values['window.matchesEvidence'] !== true) failures.push('matches value wrong');
  if (result.values['window.mutationEvidence.length'] < 1) failures.push('mutation records missing');
  if (result.values['crypto.randomUUID().length'] !== 36) failures.push('crypto randomUUID wrong');
  if (result.values['structuredClone({a:1}).a'] !== 1) failures.push('structuredClone wrong');
  if (!evidence.probes.some(p => p.value === 'inner-fire')) failures.push('localSecret probe missing');
  if (!evidence.probes.some(p => p.value === 2)) failures.push('count probe missing');
  if (failures.length) {
    console.error(safeStringify({ failures }));
    process.exit(1);
  }
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
