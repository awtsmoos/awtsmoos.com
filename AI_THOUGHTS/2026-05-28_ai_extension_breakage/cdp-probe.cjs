//B"H
const net = require('net');
const crypto = require('crypto');

async function main() {
  const url = process.argv[2] || 'http://localhost:8080/ai/?awtsmoosChatGPTMode=regular&awtsmoosAi=chatgpt';
  const tabs = await json('http://127.0.0.1:9222/json');
  let tab = tabs.find(t => t.type === 'page' && String(t.url || '').includes('/ai/')) || tabs.find(t => t.type === 'page');
  if (!tab) throw new Error('No Chrome page target found');
  const cdp = await connect(tab.webSocketDebuggerUrl);
  const logs = [];
  cdp.event = ev => {
    if (ev.method === 'Runtime.consoleAPICalled') logs.push({ type: ev.params.type, text: ev.params.args.map(a => a.value || a.description || '').join(' ') });
    if (ev.method === 'Runtime.exceptionThrown') logs.push({ type: 'exception', text: ev.params.exceptionDetails?.text || ev.params.exceptionDetails?.exception?.description || '' });
  };
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url });
  await sleep(7000);
  const expression = `JSON.stringify({
    href: location.href,
    ready: document.readyState,
    title: document.title,
    awtsmoosFetch: typeof window.awtsmoosFetch,
    mFetch: typeof window.mFetch,
    bridgeReady: Boolean(window.__awtsmoosServerReady),
    listText: document.getElementById('conversation-items')?.innerText || '',
    listHtml: document.getElementById('conversation-items')?.innerHTML || '',
    transportText: document.getElementById('transport-status')?.innerText || '',
    chatText: (document.getElementById('chat-box')?.innerText || '').slice(0,800)
  })`;
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify({ page: JSON.parse(result.result.value), logs: logs.slice(-80) }, null, 2));
  cdp.close();
}

function json(url) { return fetch(url).then(r => r.json()); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function connect(wsUrl) {
  const u = new URL(wsUrl);
  const key = crypto.randomBytes(16).toString('base64');
  const socket = net.connect(Number(u.port), u.hostname);
  let nextId = 1;
  const pending = new Map();
  let buffer = Buffer.alloc(0);
  const api = { event:null, close: () => socket.end(), send(method, params = {}) {
    const id = nextId++;
    const payload = JSON.stringify({ id, method, params });
    socket.write(frame(payload));
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (pending.has(id)) { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }
      }, 30000);
    });
  }};
  socket.on('data', data => {
    buffer = Buffer.concat([buffer, data]);
    if (buffer.includes(Buffer.from('\r\n\r\n'))) buffer = buffer.slice(buffer.indexOf(Buffer.from('\r\n\r\n')) + 4);
    for (;;) {
      const parsed = unframe(buffer);
      if (!parsed) break;
      buffer = buffer.slice(parsed.bytes);
      const msg = JSON.parse(parsed.text);
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id); pending.delete(msg.id);
        msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
      } else api.event?.(msg);
    }
  });
  return new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('connect', () => {
      socket.write([
        `GET ${u.pathname}${u.search} HTTP/1.1`,
        `Host: ${u.host}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '\r\n'
      ].join('\r\n'));
      setTimeout(() => resolve(api), 250);
    });
  });
}

function frame(text) {
  const payload = Buffer.from(text);
  const mask = crypto.randomBytes(4);
  let head;
  if (payload.length < 126) head = Buffer.from([0x81, 0x80 | payload.length]);
  else if (payload.length < 65536) { head = Buffer.alloc(4); head[0] = 0x81; head[1] = 0x80 | 126; head.writeUInt16BE(payload.length, 2); }
  else { head = Buffer.alloc(10); head[0] = 0x81; head[1] = 0x80 | 127; head.writeBigUInt64BE(BigInt(payload.length), 2); }
  const out = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) out[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([head, mask, out]);
}

function unframe(buf) {
  if (buf.length < 2) return null;
  const op = buf[0] & 0x0f;
  let len = buf[1] & 0x7f;
  let off = 2;
  if (len === 126) { if (buf.length < 4) return null; len = buf.readUInt16BE(2); off = 4; }
  if (len === 127) { if (buf.length < 10) return null; len = Number(buf.readBigUInt64BE(2)); off = 10; }
  const masked = Boolean(buf[1] & 0x80);
  const mask = masked ? buf.slice(off, off + 4) : null;
  if (masked) off += 4;
  if (buf.length < off + len) return null;
  let payload = buf.slice(off, off + len);
  if (mask) payload = Buffer.from(payload.map((b, i) => b ^ mask[i % 4]));
  if (op === 8) return { text: '{}', bytes: off + len };
  return { text: payload.toString('utf8'), bytes: off + len };
}

main().catch(e => { console.error(e.stack || e); process.exit(1); });
