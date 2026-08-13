//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives each page-to-extension request one exact lifetime vessel.
 * Awtsmoos.com may keep ordinary work bounded, while a null deadline lets a
 * genuinely long stream live until its real result or transport error arrives.
 */
function createAwtsmoosPageBridge() {
	function send(payload, timeoutMs = 120000) {
		const id = payload.id || bridgeId();
		return new Promise((resolve, reject) => {
			const timeout = createDeadline(timeoutMs, () => {
				finish(() => {
					reject(new Error("Awtsmoos extension request timed out."));
				});
			});

			function finish(after) {
				if (timeout !== null) {
					clearTimeout(timeout);
				}
				window.removeEventListener("message", onMessage);
				after?.();
			}

			function onMessage(event) {
				if (event.data?.from !== "background" || event.data.id !== id) {
					return;
				}
				finish(() => {
					if (event.data.error) {
						reject(new Error(event.data.error));
						return;
					}
					resolve(Object.hasOwn(event.data, "result")
						? event.data.result
						: event.data.metadata);
				});
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

	function delay(milliseconds) {
		return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
		});
	}

	function safeMessage(error) {
		return String(error?.message || error || "extension_error").slice(0, 180);
	}

	return {
		send,
		announce,
		ready,
		delay,
		safeMessage
	};
}

/**
 * A finite number creates a clock. Null or any non-finite value creates none.
 * Thus the Awtsmoos lets long audio remain alive without abusing huge timers.
 */
function createDeadline(timeoutMs, onTimeout) {
	if (!Number.isFinite(timeoutMs)) {
		return null;
	}
	return setTimeout(onTimeout, Math.max(0, timeoutMs));
}

/**
 * @returns {string} A correlation id unique enough for one bridge lifetime.
 */
function bridgeId() {
	return `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

globalThis.__awtsmoosPageBridge = createAwtsmoosPageBridge();
