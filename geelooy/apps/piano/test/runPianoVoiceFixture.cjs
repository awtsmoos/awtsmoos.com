//B"H
/** Drives the REAL piano page (390px, fake mic): start, play keys, record a voice take while playing, stop, verify. */
const { WebSocket } = require('undici');
const { spawn } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run(url) {
	const profile = mkdtempSync(join(tmpdir(), 'piano-voice-'));
	const chrome = spawn(process.env.CHROME_BIN || 'google-chrome', ['--headless', '--no-sandbox',
		'--disable-dev-shm-usage', '--disable-gpu', '--autoplay-policy=no-user-gesture-required',
		'--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--window-size=390,844',
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
				const timeout = setTimeout(() => { ws.removeEventListener('message', receive); reject(Error('CDP timeout ' + method)); }, 30000);
				function receive(event) { const message = JSON.parse(event.data); if (message.id !== request) return; clearTimeout(timeout); ws.removeEventListener('message', receive); if (message.error) reject(Error(message.error.message)); else resolve(message.result); }
				ws.addEventListener('message', receive);
				ws.send(JSON.stringify({ id: request, method, params }));
			});
		}
		const evaluate = async expression => (await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;
		const until = async (expression, label, tries = 200) => {
			for (let i = 0; i < tries; i++) { if (await evaluate(expression)) return; await wait(250); }
			throw Error('Timed out waiting for ' + label);
		};
		await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
		await until('!!document.querySelector("#start-button")', 'start button');
		await evaluate('document.querySelector("#start-button").click()');
		await until('document.querySelectorAll(".key").length > 10', 'keyboard keys', 240);
		await until('!!document.querySelector("#voice-take-controls .voice-take-record")', 'voice take control', 240);
		const tapKey = `(() => { const key = document.querySelectorAll(".key")[12];
			key.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 7 }));
			key.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 7 })); return true; })()`;
		await evaluate(tapKey);
		await evaluate('document.querySelector(".voice-take-record").click()');
		await until('document.querySelector(".voice-take-record").textContent.includes("Stop")', 'take recording', 80);
		await evaluate(tapKey); // Playing keys while the mic records.
		await wait(1100);
		await evaluate(tapKey);
		await evaluate('document.querySelector(".voice-take-record").click()');
		await until('document.querySelector(".voice-take-status")?.textContent.includes("Voice take kept")', 'take kept', 80);
		const status = await evaluate('document.querySelector(".voice-take-status").textContent');
		const playEnabled = await evaluate('!document.querySelector(".voice-take-play").disabled');
		const overflow = await evaluate('document.documentElement.scrollWidth - innerWidth');
		console.log(`PASS piano-voice status="${status}" play-enabled=${playEnabled} overflow=${overflow}`);
	} finally { ws?.close(); chrome.kill('SIGTERM'); await wait(300); try { rmSync(profile, { recursive: true, force: true }); } catch (error) { /* Temp profile. */ } }
}
run(process.argv[2]).catch(error => { console.error(error); process.exitCode = 1; });
