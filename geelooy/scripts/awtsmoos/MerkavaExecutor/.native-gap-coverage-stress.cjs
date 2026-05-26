// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const required = [
    'id','class','src','href','aria-*','data-*','placeholder','required','selected','allowfullscreen',
    ':has','::selection','::file-selector-button','[',']','~=',':focus-within',':nth-of-type',
    'absolute','relative','block','inline','space-between','linear-gradient','var','clamp','minmax',
    'MutationObserver','ResizeObserver','getBoundingClientRect','attachShadow','removeAttribute',
    'Reflect','Proxy','Intl','Uint8ClampedArray','SharedArrayBuffer','Object','defineProperty',
    'fs/promises','randomUUID','createReadStream','worker_threads','ServiceWorker','BroadcastChannel','importScripts'
  ];
  for (const name of required) assert.ok(Object.prototype.hasOwnProperty.call(M.NATIVE_INDEX, name), `missing native id: ${name}`);

  const html = `<button id="send" class="primary" disabled data-role="go" aria-label="Send">Send</button>`;
  const bin = await M.compileToBinary({ files: { '/index.html': html }, entry: '/index.html' }, { type: 'source', format: 'mapp' });
  const run = await M.executeBinary(bin);
  const send = run.web.document.getElementById('send');
  assert.strictEqual(send.className, 'primary');
  assert.strictEqual(send.dataset.role, 'go');
  assert.strictEqual(send.getAttribute('aria-label'), 'Send');
  assert.ok(Object.prototype.hasOwnProperty.call(send.attributes, 'disabled'));

  console.log(JSON.stringify({
    ok: true,
    nativeCounts: {
      htmlTags: M.HTML_TAGS.length,
      htmlAttrs: M.HTML_ATTRS.length,
      cssProperties: M.CSS_PROPERTIES.length,
      cssValues: M.CSS_VALUES.length,
      cssSelectors: M.CSS_SELECTORS.length,
      dom: M.DOM_PROPS_METHODS.length,
      js: M.JS_NATIVE.length,
      node: M.NODE_METHODS.length,
      worker: M.WORKER_APIS.length,
      total: M.ALL_NATIVE_WORDS.length
    },
    attrRoundtrip: send.attributes,
    dataset: send.dataset,
    compiledBytes: bin.length
  }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
