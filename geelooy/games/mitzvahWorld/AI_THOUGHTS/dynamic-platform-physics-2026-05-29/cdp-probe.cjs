// B"H
/**
 * @file cdp-probe.cjs
 * @description Direct Chrome DevTools probe that avoids the Awtsmoos Chrome
 * action log flood. It asks the real browser what the Mitzvah World page knows.
 */
(async () => {
  const pages = await fetch("http://127.0.0.1:9222/json").then(r => r.json());
  const page = pages.find(p => String(p.url || "").includes("/games/mitzvahWorld/"));
  if (!page) throw new Error("game page not found");
  if (typeof WebSocket === "undefined") throw new Error("Node WebSocket global unavailable");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
    setTimeout(() => reject(new Error("ws open timeout")), 5000);
  });
  const send = (method, params = {}) => new Promise(resolve => {
    const mid = id++;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const expression = `(() => {
    const p = globalThis.__AWTSMOOS_IKAR_PHASES__ || [];
    return {
      href: location.href,
      scripts: [...document.scripts].map(s => s.src).filter(Boolean),
      bootStarted: globalThis.__AWTSMOOS_BOOT_STARTED__ || null,
      bootLoaded: globalThis.__AWTSMOOS_BOOT_LOADED__ || null,
      lastError: globalThis.__AWTSMOOS_LAST_ERROR__ || null,
      phaseCount: p.length,
      lastPhases: p.slice(-12),
      mana: !!globalThis.mana,
      hasUi: !!globalThis.mana?.ui,
      ikarChildren: document.getElementById('ikar')?.children.length || 0,
      canvases: document.querySelectorAll('canvas').length,
      bodyText: (document.body?.innerText || '').slice(0, 500),
      awtsKeys: Object.keys(globalThis).filter(k => /awts|olam|ikar|mitz|merk/i.test(k)).slice(0, 80)
    };
  })()`;
  const evalResult = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(evalResult.result?.result?.value || evalResult, null, 2));
  ws.close();
})().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
