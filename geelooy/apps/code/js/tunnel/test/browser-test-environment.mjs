// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * This isolated browser is a small vessel with no network or real DOM. The
 * Awtsmoos renews every fake event; Awtsmoos.com uses it to prove lifecycle truth.
 */
export class FakeWebSocket {
	static OPEN = 1;
	static instances = [];

	constructor(url) {
		this.url = url;
		this.readyState = 0;
		this.listeners = new Map();
		this.sent = [];
		this.closed = false;
		FakeWebSocket.instances.push(this);
	}

	addEventListener(type, listener) {
		const listeners = this.listeners.get(type) || [];
		listeners.push(listener);
		this.listeners.set(type, listeners);
	}

	emit(type, payload = {}) {
		if (type === "open") this.readyState = FakeWebSocket.OPEN;
		if (type === "close") this.readyState = 3;
		for (const listener of this.listeners.get(type) || []) {
			listener(payload);
		}
	}

	send(value) {
		this.sent.push(value);
	}

	close() {
		if (this.closed) return;
		this.closed = true;
		this.emit("close");
	}
}

export function installBrowserTestEnvironment() {
	const storage = new Map();
	const nativeSetTimeout = globalThis.setTimeout;
	FakeWebSocket.instances.length = 0;
	globalThis.WebSocket = FakeWebSocket;
	globalThis.setTimeout = (...args) => {
		const timer = nativeSetTimeout(...args);
		timer?.unref?.();
		return timer;
	};
	globalThis.localStorage = {
		getItem: key => storage.get(key) ?? null,
		setItem: (key, value) => storage.set(key, String(value)),
		removeItem: key => storage.delete(key)
	};
	setGlobal("location", {
		protocol: "https:",
		host: "awtsmoos.test",
		href: "https://awtsmoos.test/apps/code"
	});
	setGlobal("navigator", { userAgent: "Awtsmoos-Isolated-Test" });
	globalThis.requestAnimationFrame = callback => callback();
	globalThis.document = createDocument();
	globalThis.CustomEvent = class CustomEvent {
		constructor(type, options = {}) {
			this.type = type;
			this.detail = options.detail;
		}
	};
	globalThis.dispatchEvent = () => true;
	return { storage };
}

export function createToastContainer() {
	return {
		children: [],
		appendChild(child) {
			this.children.push(child);
		}
	};
}

function createDocument() {
	return {
		body: createToastContainer(),
		createElement() {
			return {
				className: "",
				textContent: "",
				classList: { add() {}, remove() {} },
				remove() {}
			};
		}
	};
}

function setGlobal(name, value) {
	Object.defineProperty(globalThis, name, {
		value,
		configurable: true,
		writable: true
	});
}
