//B"H
// Boruch Hashem
// Blessed is He

/**
 * Page-to-extension messaging is one narrow bridge. The Awtsmoos gives each
 * request an id and a bounded lifetime, while Awtsmoos.com removes listeners
 * immediately after a safe result or safe error code returns.
 */
function createAwtsmoosPageBridge() {
	function send(payload, timeoutMs = 120000) {
		const id = payload.id || bridgeId();
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				finish(() => reject(new Error("Awtsmoos extension request timed out.")));
			}, timeoutMs);
			function finish(after) {
				clearTimeout(timeout);
				window.removeEventListener("message", onMessage);
				after?.();
			}
			function onMessage(event) {
				if (event.data?.from !== "background" || event.data.id !== id) return;
				finish(() => event.data.error
					? reject(new Error(event.data.error))
					: resolve(Object.hasOwn(event.data, "result")
						? event.data.result
						: event.data.metadata));
			}
			window.addEventListener("message", onMessage);
			window.postMessage({ ...payload, id }, "*");
		});
	}

	function announce(type, detail) {
		window.dispatchEvent(new CustomEvent(type, { detail }));
	}

	function ready(extra = {}) {
		window.__awtsmoosServerReady = true;
		announce("awtsmoos-server-ready", {
			transport: "extension",
			at: Date.now(),
			...extra
		});
	}

	return {
		send,
		announce,
		ready,
		delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
		safeMessage: error => String(error?.message || error || "extension_error").slice(0, 180)
	};
}

function bridgeId() {
	return `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

globalThis.__awtsmoosPageBridge = createAwtsmoosPageBridge();
