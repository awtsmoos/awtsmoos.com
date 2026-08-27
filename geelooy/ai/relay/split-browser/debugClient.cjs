//B"H

/**
 * B"H — Browser-side executor for the split relay debug queue.
 *
 * This gives Node a Puppeteer-shaped vocabulary while the real execution still
 * happens inside the local mirrored browser tab.
 */
function debugClientScript() {
  return `(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get('awtsmoosDebugSession') || localStorage.getItem('awtsmoosDebugSession');
    if (!session || globalThis.__awtsmoosDebugClient) return;
    globalThis.__awtsmoosDebugClient = true;
    localStorage.setItem('awtsmoosDebugSession', session);
    const report = (command, ok, result) => fetch('/debug/result', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, command, ok, result })
    }).catch(() => {});
    const run = async cmd => {
      try {
        let result = null;
        if (cmd.action === 'goto') { location.href = cmd.payload.url; result = { href: location.href }; }
        else if (cmd.action === 'evaluate') result = await (0, eval)(cmd.payload.expression);
        else if (cmd.action === 'click') { document.querySelector(cmd.payload.selector)?.click(); result = { clicked: Boolean(document.querySelector(cmd.payload.selector)) }; }
        else if (cmd.action === 'type') { const el = document.querySelector(cmd.payload.selector); if (el) { el.focus?.(); el.value = (el.value || '') + cmd.payload.text; el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: cmd.payload.text })); } result = { typed: Boolean(el) }; }
        else if (cmd.action === 'screenshot') result = { unsupported: true, reason: 'screenshots require Chrome DevTools or canvas capture permission' };
        await report(cmd.id, true, result);
      } catch (error) {
        await report(cmd.id, false, { error: error.stack || error.message || String(error) });
      }
    };
    setInterval(async () => {
      try {
        const data = await (await fetch('/debug/commands?session=' + encodeURIComponent(session), { cache: 'no-store' })).json();
        for (const cmd of data.commands || []) await run(cmd);
      } catch {}
    }, 750);
  })();\n`;
}

module.exports = { debugClientScript };
