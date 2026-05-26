// B"H
const assert = require('assert');
const M = require('./merkavaexecutor.cjs');

(async () => {
  const document = M.createDocumentStub();
  const root = document.createElement('main');
  root.setAttribute('id', 'root');
  root.setAttribute('class', 'shell');
  document.body.appendChild(root);
  const btn = document.createElement('button');
  btn.setAttribute('id', 'go');
  btn.setAttribute('class', 'primary action');
  btn.setAttribute('data-kind', 'spark');
  btn.textContent = 'Send';
  root.appendChild(btn);
  const row = document.createElement('awts-row');
  row.setAttribute('id', 'row');
  row.setAttribute('awts-kind', 'spark');
  root.appendChild(row);

  assert.strictEqual(document.getElementById('go'), btn);
  assert.strictEqual(document.querySelector('#go'), btn);
  assert.strictEqual(document.querySelector('button.primary[data-kind="spark"]:hover'), btn);
  assert.strictEqual(document.querySelector('awts-row[awts-kind="spark"]'), row);
  assert.strictEqual(document.querySelectorAll('button, awts-row').length, 2);

  let clicked = 0;
  btn.addEventListener('click', () => clicked++);
  assert.strictEqual(btn.dispatchEvent({ type: 'click' }), true);
  assert.strictEqual(clicked, 1);
  assert.strictEqual(btn.getAttribute('data-kind'), 'spark');
  btn.removeChild?.({}); // no-op style compatibility smoke if present/absent

  const nativeBehavior = {
    document: ['createElement','getElementById','querySelector','querySelectorAll'],
    element: ['appendChild','removeChild','setAttribute','getAttribute','addEventListener','dispatchEvent'],
    cssMatching: ['tag','id','class','attribute','comma-group','static-pseudo-noop'],
    cssApplying: ['SET_STYLE_BLOCK','SET_STYLE','SET_ATTR'],
    jsVm: ['compact-class-subset','compact-module-counter-render','descriptor-vm-subset'],
    notBrowserComplete: ['layout','paint','cascade-specificity-complete',':has-full','ShadowDOM-complete','MutationObserver-complete']
  };

  console.log(JSON.stringify({ ok: true, clicked, nativeBehavior }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
