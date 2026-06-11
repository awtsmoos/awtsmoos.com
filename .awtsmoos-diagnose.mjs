const pages = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = pages.find(p => String(p.url||'').includes('/heichelos/ikar/series/')) || pages.find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
await new Promise((r,j)=>{ ws.onopen=r; ws.onerror=j; });
function send(method, params={}) { const i=++id; ws.send(JSON.stringify({id:i, method, params})); return new Promise(r=>pending.set(i,r)); }
await send('Runtime.enable');
const expression = `(() => { const q=s=>document.querySelector(s); const data=el=>el?({cls:String(el.className).slice(0,60),pos:getComputedStyle(el).position,overflowY:getComputedStyle(el).overflowY,height:getComputedStyle(el).height,top:el.scrollTop,sh:el.scrollHeight,ch:el.clientHeight}):null; const mid=document.elementFromPoint(innerWidth/2, innerHeight*0.55); return {repair:!!window.__awtsmoosReaderScrollRepair, bridge:!!window.__awtsmoosReaderWheelBridge, hit:{tag:mid?.tagName,id:mid?.id,cls:String(mid?.className||'').slice(0,60)}, shell:data(q('.post-reader-localized-context')), main:data(q('.post-reader-localized-context > .main')), wrapper:data(q('.scroll-view-wrapper')), real:data(q('#realPost')), virtual:data(q('#virtual-scroll-container')), chunks:document.querySelectorAll('#virtual-scroll-container > .scroll-chunk').length, sections:document.querySelectorAll('#realPost .section').length}; })()`;
const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
console.log(JSON.stringify(result.result.result.value, null, 2));
ws.close();
