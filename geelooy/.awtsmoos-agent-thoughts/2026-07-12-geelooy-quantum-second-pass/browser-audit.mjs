// B"H
import fs from "node:fs/promises";
import path from "node:path";

const [routePath, widthText, heightText, outputDirectory, label] = process.argv.slice(2);
const width = Number(widthText || 1440);
const height = Number(heightText || 1000);
const pageUrl = new URL(routePath, "http://127.0.0.1:8080").href;
const target = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent("about:blank")}`, {
	method: "PUT"
}).then(response => response.json());
if (!target?.webSocketDebuggerUrl) throw new Error(`Could not create Chrome target for ${routePath}`);

class CdpSession {
	constructor(webSocketUrl) {
		this.socket = new WebSocket(webSocketUrl);
		this.nextId = 1;
		this.pending = new Map();
		this.socket.addEventListener("message", event => void this.receive(event.data));
		this.socket.addEventListener("error", event => this.failAll(new Error(event.message || "WebSocket error")));
		this.socket.addEventListener("close", () => this.failAll(new Error("WebSocket closed")));
	}
	async open() {
		if (this.socket.readyState === WebSocket.OPEN) return;
		await Promise.race([
			new Promise((resolve, reject) => {
				this.socket.addEventListener("open", resolve, { once: true });
				this.socket.addEventListener("error", reject, { once: true });
			}),
			new Promise((_, reject) => setTimeout(() => reject(new Error("WebSocket open timeout")), 10000))
		]);
	}
	async receive(rawMessage) {
		const text = typeof rawMessage === "string"
			? rawMessage
			: rawMessage instanceof Blob
				? await rawMessage.text()
				: Buffer.from(rawMessage).toString("utf8");
		const message = JSON.parse(text);
		if (!message.id) return;
		const deferred = this.pending.get(message.id);
		this.pending.delete(message.id);
		clearTimeout(deferred?.timer);
		message.error ? deferred?.reject(new Error(message.error.message)) : deferred?.resolve(message.result);
	}
	call(method, params = {}, timeoutMs = 15000) {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`${method} timed out`));
			}, timeoutMs);
			this.pending.set(id, { resolve, reject, timer });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}
	failAll(error) {
		for (const deferred of this.pending.values()) {
			clearTimeout(deferred.timer);
			deferred.reject(error);
		}
		this.pending.clear();
	}
}

const session = new CdpSession(target.webSocketDebuggerUrl);
console.error(`[audit] opening ${pageUrl} ${width}x${height}`);
await session.open();
await session.call("Page.enable");
await session.call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 });
await session.call("Page.navigate", { url: pageUrl }, 30000);
await new Promise(resolve => setTimeout(resolve, 4000));
console.error("[audit] page loaded");

const expression = `(() => {
	const summarize = element => {
		const rect = element.getBoundingClientRect();
		const style = getComputedStyle(element);
		return {
			tag: element.tagName,
			id: element.id,
			className: String(element.className || '').slice(0, 180),
			text: String(element.innerText || element.getAttribute('aria-label') || '').trim().slice(0, 220),
			rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
			style: { display: style.display, position: style.position, background: style.background, borderRadius: style.borderRadius, boxShadow: style.boxShadow }
		};
	};
	const candidates = [...document.querySelectorAll('header,main,section,aside,nav,article,dialog,[role="dialog"],[class*="hero"],[class*="mail"],[class*="quantum"],[class*="feed"]')];
	const overflow = [...document.querySelectorAll('body *')].filter(element => element.scrollWidth > element.clientWidth + 2 && getComputedStyle(element).overflowX === 'visible').slice(0, 30).map(summarize);
	return {
		title: document.title,
		url: location.href,
		viewport: { width: innerWidth, height: innerHeight },
		documentSize: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, scrollHeight: document.documentElement.scrollHeight },
		bodyClass: document.body.className,
		text: document.body.innerText.slice(0, 6000),
		counts: { links: document.links.length, buttons: document.querySelectorAll('button').length, forms: document.forms.length, articles: document.querySelectorAll('article').length, dialogs: document.querySelectorAll('dialog,[role="dialog"]').length },
		deadLinks: [...document.querySelectorAll('a[href="#"],a:not([href])')].map(summarize),
		passwordOutsideForms: [...document.querySelectorAll('input[type="password"]')].filter(input => !input.closest('form')).length,
		overflow,
		landmarks: candidates.slice(0, 100).map(summarize),
		controls: [...document.querySelectorAll('button,a,input,textarea,select')].filter(element => element.getBoundingClientRect().width > 0).slice(0, 140).map(summarize)
	};
})()`;
const evaluation = await session.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, 20000);
const metrics = evaluation.result.value;
console.error("[audit] DOM evaluated");
const screenshot = await session.call("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false }, 30000);
const report = { capturedAt: new Date().toISOString(), target: { id: target.id, url: pageUrl }, metrics };
await fs.mkdir(outputDirectory, { recursive: true });
await fs.writeFile(path.join(outputDirectory, `${label}.png`), Buffer.from(screenshot.data, "base64"));
await fs.writeFile(path.join(outputDirectory, `${label}.json`), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ label, screenshot: `${label}.png`, report: `${label}.json`, metrics: { title: metrics.title, documentSize: metrics.documentSize, counts: metrics.counts, deadLinks: metrics.deadLinks.length, overflow: metrics.overflow.length } }, null, 2));
session.socket.close();
await fetch(`http://127.0.0.1:9222/json/close/${target.id}`).catch(() => null);
setTimeout(() => process.exit(0), 100);
