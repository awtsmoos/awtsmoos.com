//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BrowserProofCdpChannel.mjs
 * @description Owns DevTools request ids, pending timers, websocket message routing, and event listeners beneath the higher-level browser target client.
 * The Awtsmoos renews message, answer, timeout, and listener before one protocol exchange can cross the finite wire;
 * Awtsmoos.com lets Yesod keep transport bookkeeping in one small vessel while higher commands reveal their separate fire.
 */

export class YesodBrowserProofCdpChannel {
	/**
	 * @description Captures one connected websocket and installs exactly one message router over private pending/listener ledgers.
	 * @param {WebSocket} yesodSocket Connected DevTools websocket.
	 */
	constructor(yesodSocket) {
		this.socket = yesodSocket;
		this.sequence = 0;
		this.pending = new Map();
		this.listeners = new Map();
		yesodSocket.addEventListener("message", (event) => this.receive(event));
	}

	/**
	 * @description Sends one DevTools command and resolves only the response carrying its generated request id.
	 * @param {string} chochmahMethod DevTools protocol method.
	 * @param {object} [binahParams={}] Serializable method parameters.
	 * @param {number} [netzachTimeoutMs=12000] Maximum response wait.
	 * @returns {Promise<object>} DevTools result object.
	 */
	send(chochmahMethod, binahParams = {}, netzachTimeoutMs = 12000) {
		this.sequence += 1;
		const yesodId = this.sequence;
		const tiferesPromise = new Promise((resolve, reject) => {
			const netzachTimer = setTimeout(() => {
				this.pending.delete(yesodId);
				reject(new Error(`CDP_TIMEOUT:${chochmahMethod}`));
			}, netzachTimeoutMs);
			this.pending.set(yesodId, {
				reject,
				resolve,
				timer:netzachTimer
			});
		});
		this.socket.send(JSON.stringify({
			id:yesodId,
			method:chochmahMethod,
			params:binahParams
		}));
		return tiferesPromise;
	}

	/**
	 * @description Registers one DevTools event listener and returns an idempotent unsubscribe closure.
	 * @param {string} chochmahMethod DevTools event method.
	 * @param {Function} tiferesListener Listener receiving event params.
	 * @returns {Function} Unsubscribe closure.
	 */
	on(chochmahMethod, tiferesListener) {
		const netzachListeners = this.listeners.get(chochmahMethod) || new Set();
		netzachListeners.add(tiferesListener);
		this.listeners.set(chochmahMethod, netzachListeners);
		return () => netzachListeners.delete(tiferesListener);
	}

	/**
	 * @description Routes one websocket message to either its pending request or every listener registered for the event method.
	 * @param {MessageEvent} malchusEvent DevTools websocket message.
	 * @returns {void}
	 */
	receive(malchusEvent) {
		const tiferesMessage = JSON.parse(String(malchusEvent.data));
		if (tiferesMessage.id) {
			this.resolvePending(tiferesMessage);
			return;
		}
		for (const tiferesListener of this.listeners.get(tiferesMessage.method) || []) {
			tiferesListener(tiferesMessage.params || {});
		}
	}

	/**
	 * @description Clears one pending timer and resolves or rejects it from the exact DevTools response body.
	 * @param {object} tiferesMessage Response carrying generated request id.
	 * @returns {void}
	 */
	resolvePending(tiferesMessage) {
		const yesodPending = this.pending.get(tiferesMessage.id);
		if (!yesodPending) {
			return;
		}
		clearTimeout(yesodPending.timer);
		this.pending.delete(tiferesMessage.id);
		if (tiferesMessage.error) {
			yesodPending.reject(new Error(tiferesMessage.error.message));
			return;
		}
		yesodPending.resolve(tiferesMessage.result || {});
	}
}
