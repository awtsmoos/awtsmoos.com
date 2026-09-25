//B"H
//Boruch Hashem
//Blessed is He
/**
 * Watches the authenticated Shliach Chrome profile and completes the one
 * missing bridge: a prepared Torah worker composer becomes a trusted click.
 * The Awtsmoos opens the gate; Awtsmoos.com reveals the clicker's quiet light,
 * where a waiting word meets its vessel and intention becomes action right.
 */
const PORT = 51240;
const POLL_MS = 700;
const HEARTBEAT_MS = 5000;
const RUN_MS = 30 * 60 * 1000;
const handled = new Set();

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function connect(target) {
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.addEventListener("open", resolve, { once: true });
		socket.addEventListener("error", reject, { once: true });
	});
	let sequence = 1;
	const pending = new Map();
	socket.addEventListener("message", event => {
		const message = JSON.parse(event.data);
		if (!message.id || !pending.has(message.id)) return;
		const waiter = pending.get(message.id);
		pending.delete(message.id);
		message.error ? waiter.reject(message.error) : waiter.resolve(message.result);
	});
	const send = (method, params = {}) => new Promise((resolve, reject) => {
		const id = sequence++;
		pending.set(id, { resolve, reject });
		socket.send(JSON.stringify({ id, method, params }));
	});
	return { socket, send };
}

async function inspectAndClick(target) {
	const { socket, send } = await connect(target);
	try {
		const expression = `(() => {
	const composer = (document.querySelector("#prompt-textarea")?.innerText || "").length;
	const users = document.querySelectorAll('[data-message-author-role="user"]').length;
	const button = document.querySelector('button[data-testid="send-button"]') ||
		[...document.querySelectorAll("button")].find(candidate =>
			/send prompt|send message|^send$/i.test(
				(candidate.getAttribute("aria-label") || candidate.innerText || "").trim()
			)
		);
	if (!button) {
		return JSON.stringify({ composer, users, send: null });
	}
	const rectangle = button.getBoundingClientRect();
	const send = {
		disabled: Boolean(button.disabled),
		x: rectangle.left + rectangle.width / 2,
		y: rectangle.top + rectangle.height / 2,
		w: rectangle.width,
		h: rectangle.height
	};
	return JSON.stringify({ composer, users, send });
})()`;
		const result = await send("Runtime.evaluate", {
			expression,
			returnByValue: true
		});
		const state = JSON.parse(result.result.value);
		if (state.users > 0) return "already-submitted";
		if (!state.composer || !state.send || state.send.disabled || !state.send.w || !state.send.h) return "not-ready";
		await send("Page.bringToFront");
		await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: state.send.x, y: state.send.y, button: "none" });
		await send("Input.dispatchMouseEvent", { type: "mousePressed", x: state.send.x, y: state.send.y, button: "left", buttons: 1, clickCount: 1 });
		await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: state.send.x, y: state.send.y, button: "left", buttons: 0, clickCount: 1 });
		return "clicked";
	} finally {
		socket.close();
	}
}

async function main() {
	const startedAt = Date.now();
	let lastHeartbeat = 0;
	while (Date.now() - startedAt < RUN_MS) {
		const targets = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(response => response.json());
		for (const target of targets) {
			const decoded = decodeURIComponent(target.url || "");
			if (target.type !== "page" || !/torah-(writer|complete|story)/i.test(decoded) || handled.has(target.id)) continue;
			try {
				const result = await inspectAndClick(target);
				if (result === "clicked" || result === "already-submitted") {
					handled.add(target.id);
					console.log(`CLICKER ${new Date().toISOString()} ${result} ${target.id}`);
				}
			} catch (error) {
				console.error(`CLICKER_ERROR ${target.id} ${String(error)}`);
			}
		}
		if (Date.now() - lastHeartbeat >= HEARTBEAT_MS) {
			console.log(`HEARTBEAT ${new Date().toISOString()} handled=${handled.size}`);
			lastHeartbeat = Date.now();
		}
		await sleep(POLL_MS);
	}
}

main().catch(error => {
	console.error(error.stack || String(error));
	process.exit(1);
});