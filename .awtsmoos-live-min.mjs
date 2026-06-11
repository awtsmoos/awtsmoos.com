const pages = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = pages.find(p => String(p.url||'').includes('/heichelos/ikar/series/')) || pages.find(p => p.type === 'page');
if (!page) { console.log('{"error":"no-page"}'); process.exit(0); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
await new Promise((r,j)=>{ ws.onopen=r; ws.onerror=j; });
function send(method, params={}) { const i=++id; ws.send(JSON.stringify({id:i, method, params})); return new Promise(r=>pending.set(i,r)); }
await send('Runtime.enable');
const expression = `(() => { const root=document.scrollingElement||document.documentElement; const at=document.querySelector('.sub-awtsmoos,.section,#realPost')||document.body; const before=window.scrollY||root.scrollTop||0; const event=new WheelEvent('wheel',{deltaY:420,bubbles:true,cancelable:true,view:window}); at.dispatchEvent(event); const after=window.scrollY||root.scrollTop||0; return {mode:window.__awtsmoosReaderScrollRepair?.mode||'', bridgeMode:window.__awtsmoosReaderWheelBridge?.mode||'', vessel:window.__awtsmoosReaderWheelBridgeState?.vessel||'', moved:after>before, before, after, prevented:event.defaultPrevented, shellPos:getComputedStyle(document.querySelector('.post-reader-localized-context')).position, bodyOverflow:getComputedStyle(document.body).overflowY}; })()`;
const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
console.log(JSON.stringify(result.result.result.value));
ws.close();
