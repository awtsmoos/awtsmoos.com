// B"H
const { ensurePage, cdpCall } = require('../../geelooy/apps/tunnel/agent/tools/chrome/cdp.js');
(async () => {
  await ensurePage(9223);
  const x = 939;
  const y = 280;
  await cdpCall('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' }, 10000);
  await cdpCall('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, 10000);
  await cdpCall('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, 10000);
  console.log(JSON.stringify({ ok: true, clicked: { x, y } }, null, 2));
  process.exit(0);
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
