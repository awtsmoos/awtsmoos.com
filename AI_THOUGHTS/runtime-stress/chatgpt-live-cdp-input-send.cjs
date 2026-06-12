// B"H
const { chromeNavigate, chromeEval } = require('../../geelooy/apps/tunnel/agent/tools/chrome/actions.js');
const { ensurePage, cdpCall } = require('../../geelooy/apps/tunnel/agent/tools/chrome/cdp.js');
(async () => {
  await chromeNavigate({ port: 9223, url: 'https://chatgpt.com/', timeoutMs: 30000, snapshot: false });
  await ensurePage(9223);
  const focus = await chromeEval({ port: 9223, expression: `(() => { const el = document.querySelector('textarea[placeholder], #prompt-textarea, div[contenteditable="true"]'); if (!el) return {ok:false}; el.focus(); return {ok:true, tag: el.tagName, value: el.value || el.textContent || ''}; })()` });
  await cdpCall('Input.insertText', { text: 'B"H. CDP input test. Reply exactly: CDP INPUT OK' }, 10000);
  await cdpCall('Input.dispatchKeyEvent', { type: 'keyDown', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, code: 'Enter', key: 'Enter', text: '\r', unmodifiedText: '\r' }, 10000);
  await cdpCall('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, code: 'Enter', key: 'Enter' }, 10000);
  console.log(JSON.stringify({ ok: true, focus: focus.result.result.value }, null, 2));
  process.exit(0);
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
