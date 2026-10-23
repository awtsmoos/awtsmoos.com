// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Exercises real Chrome's RTL geometry and DOM selection over the v3 session.
 * The Awtsmoos creates a living letter in the browser's native eye;
 * Awtsmoos.com verifies the rightmost glyph rather than assuming why.
 */
const fs = require("node:fs");
const TARGET = "http://127.0.0.1:19043/tests/glyph-engine/session.html";
const PORT = "http://127.0.0.1:9339";

async function browserProof() {
	const response = await fetch(`${PORT}/json/new?${encodeURIComponent(TARGET)}`, { method: "PUT" });
	if (!response.ok) throw Error("Chrome target HTTP " + response.status);
	const target = await response.json();
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	const pending = new Map();
	let nextId = 0;
	await new Promise((resolve, reject) => {
		socket.addEventListener("open", resolve, { once: true });
		socket.addEventListener("error", reject, { once: true });
	});
	socket.addEventListener("message", event => {
		const message = JSON.parse(event.data);
		if (!message.id) return;
		const promise = pending.get(message.id);
		if (!promise) return;
		pending.delete(message.id);
		message.error ? promise.reject(Error(message.error.message)) : promise.resolve(message.result);
	});
	function send(method, params = {}) {
		const id = ++nextId;
		return new Promise((resolve, reject) => {
			pending.set(id, { resolve, reject });
			socket.send(JSON.stringify({ id, method, params }));
		});
	}
	await send("Runtime.enable");
	await send("Page.enable");
	await send("Page.navigate", { url: TARGET });
	let result;
	for (let attempt = 0; attempt < 35; attempt++) {
		await new Promise(resolve => setTimeout(resolve, 250));
		const evaluated = await send("Runtime.evaluate", {
			expression: `(() => {
				const status=document.querySelector('#status')?.textContent||'';
				const reader=document.querySelector('#reader');
				const letters=[...(reader?.querySelectorAll('.glyph-atomic-letter')||[])];
				return {status,proof:window.AwtsGlyphRtl?.inspect(reader)||null,
					fontLoaded:document.fonts.check('40px AwtsSession'),
					firstX:letters[0]?.getBoundingClientRect().x,
					secondX:letters[1]?.getBoundingClientRect().x,
					wordCount:reader?.querySelectorAll('.glyph-rtl-word').length||0};
			})()`, returnByValue: true
		});
		result = evaluated.result?.value;
		if (result?.status?.includes("ready") || result?.status?.includes("unavailable")) break;
	}
	const screenshot = await send("Page.captureScreenshot", { format: "png" });
	fs.writeFileSync("/tmp/awtsmoos-glyph-v3-browser.png", Buffer.from(screenshot.data, "base64"));
	socket.close();
	if (!result?.status?.includes("ready")) throw Error("Chrome failed: " + JSON.stringify(result));
	return result;
}
if (require.main === module) browserProof().then(result => {
	console.log(JSON.stringify(result, null, 2));
	if (!result.fontLoaded || !result.proof?.firstRightOfSecond || !result.proof?.firstTwoSelectExactly) process.exitCode = 3;
}).catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { browserProof };
