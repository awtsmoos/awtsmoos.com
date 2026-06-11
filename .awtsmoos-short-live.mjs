const pages = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = pages.find(p => String(p.url||'').includes('/heichelos/ikar/series/')) || pages.find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
await new Promise((r,j)=>{ ws.onopen=r; ws.onerror=j; });
function send(method, params={}) { const i=++id; ws.send(JSON.stringify({id:i, method, params})); return new Promise(r=>pending.set(i,r)); }
await send('Runtime.enable');
const expression = `(() => { const w=document.querySelector('.scroll-view-wrapper'); const at=document.querySelector('.sub-awtsmoos,.section,#realPost')||w; if(w) w.scrollTop=0; const e=new WheelEvent('wheel',{deltaY:420,bubbles:true,cancelable:true,view:window}); at?.dispatchEvent(e); return {url:location.href, sections:document.querySelectorAll('#realPost .section').length, chunks:document.querySelectorAll('#virtual-scroll-container > .scroll-chunk').length, target:String(at?.className||at?.id||at?.tagName), bridge:window.__awtsmoosReaderWheelBridge, bridgeState:window.__awtsmoosReaderWheelBridgeState, prevented:e.defaultPrevented, top:w?.scrollTop||0, wh:w?.clientHeight||0, ws:w?.scrollHeight||0, text:document.querySelector('#realPost')?.innerText?.slice(0,60)||''}; })()`;
const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
console.log(JSON.stringify(result.result.result.value, null, 2));
ws.close();
