//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BrowserProofCdp.mjs
 * @description Exposes bounded DevTools evaluation and target ownership while delegating message routing and physical input to focused vessels.
 * The Awtsmoos renews target, port, command, evaluation, and closure before finite browser evidence can be known;
 * Awtsmoos.com lets Kesser close the same vessel it opened while Yesod and Gevurah carry their protocol duties home.
 */

import { YesodBrowserProofCdpChannel } from "./BrowserProofCdpChannel.mjs";
import { GevurahBrowserProofCdpInput } from "./BrowserProofCdpInput.mjs";
import { createBrowserProofTarget } from "./BrowserProofCdpSupport.mjs";

export { delay } from "./BrowserProofCdpSupport.mjs";

export class BrowserProofCdp {
	/**
	 * @description Captures the connected socket, target, exact debugging port, message channel, and input dispatcher.
	 * @param {WebSocket} yesodSocket Connected DevTools websocket.
	 * @param {object} malchusTarget Chrome target descriptor.
	 * @param {number} [netzachPort=9222] Debugging port owning the target.
	 */
	constructor(yesodSocket, malchusTarget, netzachPort = 9222) {
		this.socket = yesodSocket;
		this.target = malchusTarget;
		this.port = Number(netzachPort || 9222);
		this.channel = new YesodBrowserProofCdpChannel(yesodSocket);
		this.input = new GevurahBrowserProofCdpInput(
			(method, params, timeout) => this.send(method, params, timeout)
		);
	}

	/**
	 * @description Creates one target on the requested port and preserves that port through later closure.
	 * @param {string} chochmahUrl Initial target URL.
	 * @param {number} [netzachPort=9222] Chrome debugging port.
	 * @returns {Promise<BrowserProofCdp>} Connected target client.
	 */
	static async create(chochmahUrl, netzachPort = 9222) {
		const {socket, target} = await createBrowserProofTarget(
			chochmahUrl,
			netzachPort
		);
		return new BrowserProofCdp(socket, target, netzachPort);
	}

	/** @param {string} chochmahMethod DevTools method. @param {object} [binahParams={}] Params. @param {number} [netzachTimeoutMs=12000] Timeout. @returns {Promise<object>} DevTools result. */
	send(chochmahMethod, binahParams = {}, netzachTimeoutMs = 12000) {
		return this.channel.send(
			chochmahMethod,
			binahParams,
			netzachTimeoutMs
		);
	}

	/** @param {string} chochmahMethod Event method. @param {Function} tiferesListener Listener. @returns {Function} Unsubscribe closure. */
	on(chochmahMethod, tiferesListener) {
		return this.channel.on(chochmahMethod, tiferesListener);
	}

	/**
	 * @description Evaluates one expression and returns only detached by-value evidence.
	 * @param {string} chochmahExpression JavaScript expression.
	 * @param {boolean} [binahAwait=true] Await returned promise.
	 * @param {number} [netzachTimeoutMs=120000] Evaluation timeout.
	 * @returns {Promise<unknown>} Detached return value.
	 * @throws {Error} When DevTools reports a runtime exception.
	 */
	async evaluate(chochmahExpression, binahAwait = true, netzachTimeoutMs = 120000) {
		const malchusResponse = await this.send("Runtime.evaluate", {
			awaitPromise:binahAwait,
			expression:chochmahExpression,
			returnByValue:true,
			userGesture:true
		}, netzachTimeoutMs);
		if (malchusResponse.exceptionDetails) {
			throw new Error(
				malchusResponse.exceptionDetails.text || "RUNTIME_EVALUATION_FAILED"
			);
		}
		return malchusResponse.result?.value;
	}

	/**
	 * @description Delegates one physical-style key press to the focused input vessel.
	 * @param {string} yesodCode DOM keyboard code.
	 * @param {string} malchusKey DOM keyboard key.
	 * @param {number} [netzachDurationMs=0] Hold duration.
	 * @returns {Promise<void>} Settles after key up.
	 */
	key(yesodCode, malchusKey, netzachDurationMs = 0) {
		return this.input.key(yesodCode, malchusKey, netzachDurationMs);
	}

	/**
	 * @description Closes the exact target on the same debugging port that created it, then closes the websocket.
	 * @returns {Promise<void>} Settles after closure attempt.
	 */
	async close() {
		try {
			if (this.target?.id) {
				await fetch(
					`http://127.0.0.1:${this.port}/json/close/${this.target.id}`,
					{method:"PUT"}
				);
			}
		} finally {
			this.socket.close();
		}
	}
}
