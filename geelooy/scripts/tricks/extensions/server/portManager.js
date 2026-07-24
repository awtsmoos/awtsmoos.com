//B"H
// Boruch Hashem
// Blessed is He

/**
 * Every extension port is temporary, yet the Awtsmoos recreates a path for each
 * message. Awtsmoos.com keeps routing in one small vessel so the background
 * service worker can focus on fetch, stream, automation, and direct-chat actions.
 */
class ChromePortManager {
	constructor() {
		this.ports = {};
		this.events = {};
		this.init();
	}

	on(event, listener) {
		if (typeof event === "object") {
			for (const [name, handler] of Object.entries(event)) this.on(name, handler);
			return;
		}
		(this.events[event] ||= []).push(listener);
	}

	emit(event, ...data) {
		for (const listener of this.events[event] || []) {
			Promise.resolve(listener(...data)).catch(error => {
				console.warn("B'H port listener failed", event, safeMessage(error));
			});
		}
	}

	reply(port, data) {
		if (!port) return;
		try {
			port.postMessage({ ...data, from: data?.from || data?.name || "background" });
		} catch {
			this.onPortDisconnect(port);
		}
	}

	registerPortByName(port, name) {
		if (name) this.ports[name] = port;
	}

	async sendMessageToPort(message) {
		const target = this.ports[message.to];
		if (!target) return;
		try {
			target.postMessage({ ...message, from: message.name || message.from });
		} catch {
			this.onPortDisconnect(target);
		}
	}

	onPortDisconnect(port) {
		for (const [name, saved] of Object.entries(this.ports)) {
			if (saved === port) delete this.ports[name];
		}
	}

	async handlePortMessage(port, message) {
		if (message.name) this.registerPortByName(port, message.name);
		if (message.action) this.emit(message.action, message, port);
		if (message.to) await this.sendMessageToPort(message);
		if (message.reply) this.reply(port, message.reply);
	}

	handleNewConnection(port) {
		this.registerPortByName(port, port.name);
		port.onMessage.addListener(message => this.handlePortMessage(port, message));
		port.onDisconnect.addListener(() => this.onPortDisconnect(port));
	}

	init() {
		chrome.runtime.onConnect.addListener(port => this.handleNewConnection(port));
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.command !== "send") {
				sendResponse({ error: "unknown_command" });
				return;
			}
			this.sendMessageToPort(message).then(() => sendResponse({ status: "sent" }));
			return true;
		});
	}
}

function safeMessage(error) {
	return String(error?.message || error || "extension_error").slice(0, 160);
}

globalThis.ChromePortManager = ChromePortManager;
