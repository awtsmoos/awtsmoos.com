// Background/resume/notification proof driver for the Rebbe bundle page.
// Usage: node bg-drive.mjs <url> <mode: bg|resume|notify> [seconds]
// Reuses the minimal CDP plumbing of the lane harness (drive.mjs).
import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import fs from 'node:fs';

const [url, mode, secsArg] = process.argv.slice(2);
const PORT = 9363;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const stamp = () => new Date().toISOString();
const note = line => console.log('[' + stamp() + '] ' + line);

function httpJson(path) {
	return new Promise((resolve, reject) => {
		http.get({ host: '127.0.0.1', port: PORT, path }, res => {
			let data = ''; res.on('data', c => data += c); res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
		}).on('error', reject);
	});
}
class Ws {
	constructor(wsUrl) {
		const u = new URL(wsUrl);
		this.key = crypto.randomBytes(16).toString('base64');
		this.buf = Buffer.alloc(0); this.id = 0; this.pending = new Map(); this.events = []; this.handshook = false;
		this.socket = net.connect(Number(u.port), u.hostname, () => {
			this.socket.write('GET ' + u.pathname + u.search + ' HTTP/1.1\r\nHost: ' + u.host + '\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ' + this.key + '\r\nSec-WebSocket-Version: 13\r\n\r\n');
		});
		this.opened = new Promise((resolve, reject) => {
			this.socket.once('error', reject);
			this.socket.on('data', chunk => this.onData(chunk, resolve));
		});
	}
	onData(chunk, resolve) {
		if (!this.handshook) {
			this.buf = Buffer.concat([this.buf, chunk]);
			const idx = this.buf.indexOf('\r\n\r\n');
			if (idx === -1) return;
			this.handshook = true; this.buf = this.buf.slice(idx + 4); resolve();
		} else this.buf = Buffer.concat([this.buf, chunk]);
		this.drain();
	}
	drain() {
		for (;;) {
			if (this.buf.length < 2) return;
			const b0 = this.buf[0], b1 = this.buf[1];
			const op = b0 & 0x0f; let len = b1 & 0x7f; let off = 2;
			if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
			else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
			if (b1 & 0x80) off += 4;
			if (this.buf.length < off + len) return;
			const payload = this.buf.slice(off, off + len); this.buf = this.buf.slice(off + len);
			if (op === 9) { this.sendRaw(10, payload); continue; }
			if (op !== 1) continue;
			let msg; try { msg = JSON.parse(payload.toString('utf8')); } catch { continue; }
			if (msg.id != null && this.pending.has(msg.id)) { const p = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result); }
			else if (msg.method) this.events.push({ at: stamp(), method: msg.method, params: msg.params || null });
		}
	}
	sendRaw(op, payload) {
		const mask = crypto.randomBytes(4);
		let header;
		if (payload.length < 126) header = Buffer.from([0x80 | op, 0x80 | payload.length]);
		else if (payload.length < 65536) { header = Buffer.alloc(4); header[0] = 0x80 | op; header[1] = 0x80 | 126; header.writeUInt16BE(payload.length, 2); }
		else { header = Buffer.alloc(10); header[0] = 0x80 | op; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(payload.length), 2); }
		const masked = Buffer.from(payload); for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i % 4];
		this.socket.write(Buffer.concat([header, mask, masked]));
	}
	close() { try { this.socket.destroy(); } catch {} }
}

const DL = '/tmp/rebbe-bg-harness/dl';
fs.mkdirSync(DL, { recursive: true });
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--remote-debugging-port=' + PORT, '--window-size=540,1200', '--user-data-dir=/tmp/rebbe-bg-harness/profile-' + mode, 'about:blank'], { stdio: ['ignore', 'pipe', 'pipe'] });
let ws = null;
const t0 = Date.now();
const elapsed = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';

const SAMPLE_EXPR = `(() => { const s = document.getElementById('status'); const bar = document.querySelector('#progress>div'); return JSON.stringify({ status: s ? s.textContent : null, bar: bar ? bar.style.width : null, hidden: document.hidden, vis: document.visibilityState, bg: window.__rebbeBackground || null, marker: window.__rebbeConvert ? { engine: window.__rebbeConvert.engine, done: !!window.__rebbeConvert.done } : null, blobs: (window.__savedBlobs || []).map(b => b.type + ':' + b.size) }); })()`;

const VALIDATE_EXPR = `(async () => {
	const W = window.__rebbeWebCodecs;
	const blob = window.__savedBlobs[window.__savedBlobs.length - 1];
	if (!blob) return JSON.stringify({ error: 'no saved blob' });
	const out = { blobType: blob.type, blobSize: blob.size };
	if (blob.type.indexOf('ogg') !== -1 || blob.type.indexOf('opus') !== -1) {
		const bytes = new Uint8Array(await blob.arrayBuffer());
		out.first4 = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
		const d = W.demuxOggOpus(bytes);
		out.packets = d.packets.length; out.durationSec = Math.round(d.durationUs / 1e5) / 10; out.channels = d.channels;
		let outs = 0, errs = 0;
		const dec = new AudioDecoder({ output: ad => { outs++; ad.close(); }, error: e => { errs++; } });
		dec.configure({ codec: 'opus', sampleRate: 48000, numberOfChannels: d.channels, description: d.head });
		for (const pkt of d.packets) dec.decode(new EncodedAudioChunk({ type: 'key', timestamp: pkt.timestamp, duration: pkt.duration, data: pkt.data }));
		await dec.flush(); dec.close();
		out.decodeOutputs = outs; out.decodeErrors = errs;
	}
	return JSON.stringify(out);
})()`;

try {
	let version = null;
	for (let i = 0; i < 40; i++) { try { version = await httpJson('/json/version'); break; } catch { await sleep(1000); } }
	if (!version) throw new Error('Chrome DevTools endpoint never came up');
	note('Chrome: ' + version.Browser);
	ws = new Ws(version.webSocketDebuggerUrl);
	await ws.opened;
	const send0 = (method, params = {}) => new Promise((resolve, reject) => { const id = ++ws.id; ws.pending.set(id, { resolve, reject }); ws.sendRaw(1, Buffer.from(JSON.stringify({ id, method, params }))); });
	const { targetId } = await send0('Target.createTarget', { url: 'about:blank' });
	const { sessionId } = await send0('Target.attachToTarget', { targetId, flatten: true });
	const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++ws.id; ws.pending.set(id, { resolve, reject }); ws.sendRaw(1, Buffer.from(JSON.stringify({ sessionId, id, method, params }))); setTimeout(() => { if (ws.pending.has(id)) { ws.pending.delete(id); reject(new Error('CDP timeout ' + method)); } }, 90000); });
	const evaluate = async expr => { const r = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; };
	await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
	await send0('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL, eventsEnabled: true }).catch(e => note('dlbehavior: ' + e.message));
	await send0('Browser.grantPermissions', { origin: 'https://awtsmoos.com', permissions: ['notifications'] }).catch(e => note('grantPermissions: ' + e.message));
	await call('Page.addScriptToEvaluateOnNewDocument', { source: "window.__savedBlobs=[]; const __oc = URL.createObjectURL.bind(URL); URL.createObjectURL = b => { try { window.__savedBlobs.push(b); } catch (e) {} return __oc(b); };" });
	const drainEvents = () => {
		for (const ev of ws.events.splice(0)) {
			if (ev.method === 'Runtime.exceptionThrown') note('EXCEPTION ' + JSON.stringify(ev.params.exceptionDetails).slice(0, 300));
			if (ev.method === 'Browser.downloadProgress' && ev.params.state === 'completed') note('DOWNLOAD COMPLETED ' + (ev.params.guid || ''));
		}
	};
	await call('Page.navigate', { url });
	note('Navigated ' + url + ' mode=' + mode);
	const deadline = Date.now() + Number(secsArg || 900) * 1000;
	const sample = async () => { drainEvents(); return JSON.parse(await evaluate(SAMPLE_EXPR)); };

	if (mode === 'notify') {
		// Wait for the page + SW registration, then exercise showNotification.
		let info = null;
		while (Date.now() < deadline) {
			await sleep(3000);
			try {
				info = JSON.parse(await evaluate(`(async () => {
					const out = { permission: (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported', bg: window.__rebbeBackground || null };
					if ('serviceWorker' in navigator) {
						const reg = await navigator.serviceWorker.getRegistration();
						out.sw = reg ? { scope: reg.scope, active: !!(reg.active || reg.installing || reg.waiting) } : null;
						if (reg) {
							await reg.showNotification('Rebbe conversion (test)', { body: 'Notification plumbing test', tag: 'rebbe-test', data: { url: location.href } });
							const notes = await reg.getNotifications();
							out.shown = notes.length;
							for (const n of notes) n.close();
						}
					}
					return JSON.stringify(out);
				})()`));
				if (info.sw) break;
			} catch (e) { note('notify poll: ' + e.message); }
		}
		note('NOTIFY ' + JSON.stringify(info));
	} else if (mode === 'bg') {
		let hidAt = null, decoyId = null;
		let lastStatus = '';
		const hiddenSamples = [];
		let ready = false;
		while (Date.now() < deadline) {
			await sleep(4000);
			let st;
			try { st = await sample(); } catch (e) { note('poll error: ' + e.message); continue; }
			if (st.status !== lastStatus) {
				note('[' + elapsed() + '] STATUS hidden=' + st.hidden + ' vis=' + st.vis + ' "' + st.status + '" bar=' + st.bar + ' bg=' + JSON.stringify(st.bg));
				lastStatus = st.status || '';
			}
			if (st.hidden) hiddenSamples.push({ at: elapsed(), status: st.status, bar: st.bar });
			if (!decoyId && (/Converting [23] of|Fetching for conversion [23] of/.test(st.status || '') || (Date.now() - t0 > 45000 && /Converting|Fetching/.test(st.status || '')))) {
				const t = await send0('Target.createTarget', { url: 'about:blank' });
				decoyId = t.targetId;
				await send0('Target.activateTarget', { targetId: decoyId });
				hidAt = elapsed();
				note('[' + elapsed() + '] PAGE BACKGROUNDED (decoy target activated)');
			}
			if (/ready/i.test(st.status || '')) { note('[' + elapsed() + '] READY marker=' + JSON.stringify(st.marker) + ' blobs=' + JSON.stringify(st.blobs)); ready = true; break; }
		}
		note('HIDDEN-SAMPLES count=' + hiddenSamples.length + ' ' + JSON.stringify(hiddenSamples.slice(0, 12)));
		if (ready) note('VALIDATION ' + await evaluate(VALIDATE_EXPR));
	} else if (mode === 'resume') {
		let reloaded = false, lastStatus = '';
		let ready = false;
		while (Date.now() < deadline) {
			await sleep(4000);
			let st;
			try { st = await sample(); } catch (e) { note('poll error: ' + e.message); continue; }
			if (st.status !== lastStatus) {
				note('[' + elapsed() + '] STATUS "' + st.status + '" bar=' + st.bar + ' bg=' + JSON.stringify(st.bg));
				lastStatus = st.status || '';
			}
			if (!reloaded && st.bg && st.bg.resume && st.bg.resume.doneTracks >= 1 && /Converting|Fetching/.test(st.status || '')) {
				note('[' + elapsed() + '] RELOADING mid-conversion (doneTracks=' + st.bg.resume.doneTracks + ')');
				await call('Page.reload', {});
				reloaded = true;
				await sleep(3000);
			}
			if (reloaded && /ready/i.test(st.status || '')) { note('[' + elapsed() + '] READY marker=' + JSON.stringify(st.marker) + ' blobs=' + JSON.stringify(st.blobs)); ready = true; break; }
		}
		if (ready) note('VALIDATION ' + await evaluate(VALIDATE_EXPR));
	}
} finally { if (ws) ws.close(); chrome.kill('SIGKILL'); }
note('DONE');
