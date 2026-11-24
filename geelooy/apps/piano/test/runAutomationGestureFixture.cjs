//B"H
/** Drives the automation gesture fixture with real CDP pointer input. */
const { WebSocket } = require('undici');
const { spawn } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function run(url) {
	const profile = mkdtempSync(join(tmpdir(), 'gesture-fixture-'));
	const chrome = spawn(process.env.CHROME_BIN || 'google-chrome', ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--autoplay-policy=no-user-gesture-required', '--remote-debugging-port=0', '--remote-allow-origins=*', `--user-data-dir=${profile}`, url], { stdio: 'ignore' });
	let ws;
	try {
		let tab;
		for (let i = 0; i < 100 && !tab; i++) {
			try {
				const port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0];
				tab = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((item) => item.type === 'page');
			} catch (error) {}
			await wait(100);
		}
		if (!tab) throw Error('Chromium did not launch');
		ws = new WebSocket(tab.webSocketDebuggerUrl);
		await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
		let id = 0;
		const pending = new Map();
		ws.addEventListener('message', (event) => {
			const message = JSON.parse(event.data);
			if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
		});
		const call = (method, params = {}) => new Promise((resolve, reject) => {
			const request = ++id;
			const timeout = setTimeout(() => reject(Error('CDP timed out: ' + method)), 10000);
			pending.set(request, (message) => { clearTimeout(timeout); message.error ? reject(Error(message.error.message)) : resolve(message.result); });
			ws.send(JSON.stringify({ id: request, method, params }));
		});
		const evaluate = async (expression) => (await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;
		let ready = '';
		for (let i = 0; i < 120 && ready !== 'READY'; i++) {
			ready = await evaluate('document.querySelector("#result")?.textContent');
			if (ready?.startsWith('FAIL')) throw Error(ready);
			await wait(150);
		}
		if (ready !== 'READY') throw Error('Fixture never became READY: ' + ready);
		const pos = await evaluate('window.gestureProbe.positions()');
		const mouse = (type, x, y) => call('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: type === 'mousePressed' ? 1 : 0 });
		await mouse('mousePressed', pos.x, pos.y);
		for (let step = 1; step <= 5; step++) await mouse('mouseMoved', pos.x + (pos.tx - pos.x) * step / 5, pos.y + (pos.ty - pos.y) * step / 5);
		await mouse('mouseReleased', pos.tx, pos.ty);
		await evaluate('window.gestureProbe.finish()');
		for (let i = 0; i < 120; i++) {
			const value = await evaluate('document.querySelector("#result")?.textContent');
			if (value?.startsWith('PASS')) { console.log(value); return; }
			if (value?.startsWith('FAIL')) throw Error(value);
			await wait(150);
		}
		throw Error('Gesture fixture timed out');
	} finally {
		ws?.close(); chrome.kill('SIGTERM'); await wait(300);
		try { rmSync(profile, { recursive: true, force: true }); } catch (error) {}
	}
}
run(process.argv[2]).catch((error) => { console.error(error); process.exitCode = 1; });
