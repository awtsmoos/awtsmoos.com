// B"H
/** Raw-CDP smoke test: no Playwright, no tunnel Chrome log wrapper. */
const pageUrl = 'http://localhost:8080/games/mitzvahWorld/?bh=raw-cdp-smoke-1&path=village.json';
const out = { ok: false, at: new Date().toISOString(), steps: [] };

function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = fetch(`http://127.0.0.1:9222${path}`);
    req.then(r => r.json()).then(resolve, reject);
  });
}

async function getPageTarget() {
  const targets = await getJson('/json');
  return targets.find(t => t.type === 'page') || targets[0];
}

function makeCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };
  const ready = new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = event => reject(new Error(`WebSocket error ${event.message || ''}`));
  });
  return {
    async call(method, params = {}) {
      await ready;
      const messageId = ++id;
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
        setTimeout(() => reject(new Error(`CDP timeout ${method}`)), 45000);
      });
    },
    close() { ws.close(); }
  };
}

async function evalExpr(cdp, expression, timeout = 45000) {
  const result = await cdp.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, timeout });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result?.value;
}

const target = await getPageTarget();
if (!target?.webSocketDebuggerUrl) throw new Error('No Chrome page target on 9222');
out.steps.push({ stage: 'target', url: target.url });
const cdp = makeCdp(target.webSocketDebuggerUrl);
await cdp.call('Page.enable');
await cdp.call('Runtime.enable');
await cdp.call('Page.navigate', { url: pageUrl });
out.steps.push({ stage: 'navigate' });
await new Promise(r => setTimeout(r, 5000));
out.before = await evalExpr(cdp, `(()=>({href:location.href,text:document.body.innerText.slice(0,200),buttons:[...document.querySelectorAll('button')].map(b=>b.innerText).slice(0,5),canvas:document.querySelectorAll('canvas').length}))()`);
await evalExpr(cdp, `(()=>{const b=document.querySelector('button.mitzvahBtn'); if(!b) return false; b.click(); return true;})()`);
out.steps.push({ stage: 'clicked-enter' });
await new Promise(r => setTimeout(r, 60000));
out.after = await evalExpr(cdp, `(()=>{const olam=globalThis.__AWTSMOOS_GET_ACTIVE_OLAM__?.()||globalThis.olam||globalThis.mana?.olam||globalThis.mana?.socket?.olam||null;const v=globalThis.__MITZVAH_VEHICLES__;return {href:location.href,text:document.body.innerText.slice(0,500),canvas:document.querySelectorAll('canvas').length,hasOlam:!!olam,olamKeys:Object.keys(olam||{}).slice(0,40),vehicleStatus:v?.status||null,vehicleCount:v?.vehicles?.length||0,vehicles:v?.vehicles?.map(x=>({name:x.name,type:x.vehicleType,place:x.garageLocation,pos:[Math.round(x.mesh.position.x),Math.round(x.mesh.position.y),Math.round(x.mesh.position.z)]}))||[]};})()`);
out.ok = true;
cdp.close();
console.log(JSON.stringify(out, null, 2));
