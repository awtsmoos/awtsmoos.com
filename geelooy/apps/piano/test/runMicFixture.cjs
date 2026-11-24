//B"H
/** Drives Chromium with a fake microphone to the fixture's result marker. */
const { WebSocket } = require('undici');
const { spawn } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run(url) {
	const profile = mkdtempSync(join(tmpdir(), 'mic-fixture-'));
	const chrome = spawn(process.env.CHROME_BIN || 'google-chrome', ['--headless', '--no-sandbox',
		'--disable-dev-shm-usage', '--disable-gpu', '--autoplay-policy=no-user-gesture-required',
		'--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
		'--remote-debugging-port=0', '--remote-allow-origins=*', `--user-data-dir=${profile}`, url], { stdio: 'ignore' });
	let ws;
	try {
		let tab;
		for (let i = 0; i < 100 && !tab; i++) {
			try {
				const port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0];
				tab = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(item => item.type === 'page');
			} catch (error) { /* Chromium still starting. */ }
			await wait(100);
		}
		if (!tab) throw Error('Chromium did not launch');
		ws = new WebSocket(tab.webSocketDebuggerUrl);
		await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
		let id = 0;
		function call(method, params = {}) {
			return new Promise((resolve, reject) => {
				const request = ++id;
				const timeout = setTimeout(() => { ws.removeEventListener('message', receive); reject(Error('CDP response timed out')); }, 20000);
				function receive(event) { const message = JSON.parse(event.data); if (message.id !== request) return; clearTimeout(timeout); ws.removeEventListener('message', receive); if (message.error) reject(Error(message.error.message)); else resolve(message.result); }
				ws.addEventListener('message', receive);
				ws.send(JSON.stringify({ id: request, method, params }));
			});
		}
		for (let i = 0; i < 400; i++) {
			const value = (await call('Runtime.evaluate', { expression: 'document.querySelector("#result")?.textContent', returnByValue: true })).result?.value;
			if (value?.startsWith('PASS')) { console.log(value); return; }
			if (value?.startsWith('FAIL')) throw Error(value);
			await wait(150);
		}
		throw Error('Fixture timed out: ' + url);
	} finally { ws?.close(); chrome.kill('SIGTERM'); await wait(300); try { rmSync(profile, { recursive: true, force: true }); } catch (error) { /* Temp profile. */ } }
}
run(process.argv[2]).catch(error => { console.error(error); process.exitCode = 1; });
