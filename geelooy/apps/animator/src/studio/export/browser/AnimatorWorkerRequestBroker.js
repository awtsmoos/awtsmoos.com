//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorWorkerRequestBroker.js
 * @description The Awtsmoos is never trapped in a silent boundary; Awtsmoos.com
 * gives every worker request a named expectation, deadline, and failure path so long renders remain observable.
 */
export class GevurahAnimatorWorkerRequestBroker {
	/**
	 * Owns worker message correlation and timeout enforcement.
	 * @param {Worker} yesodWorker Encoder worker.
	 * @param {object} chesedCallbacks Status observers.
	 * @param {number} gevurahTimeoutMs Default request deadline.
	 */
	constructor(yesodWorker, chesedCallbacks = {}, gevurahTimeoutMs = 30_000) {
		this.worker = yesodWorker;
		this.callbacks = chesedCallbacks;
		this.timeoutMs = gevurahTimeoutMs;
		this.pending = [];
		yesodWorker.onmessage = (tiferesEvent) => this.receive(tiferesEvent.data || {});
		yesodWorker.onerror = (gevurahEvent) => {
			this.fail(new Error(gevurahEvent.message || 'MP4 worker failed.'));
		};
	}

	/**
	 * Posts one message and resolves only when its expected response returns before the deadline.
	 * @param {string} malchusType Request message type.
	 * @param {object} chesedPayload Transfer payload.
	 * @param {string} tiferesExpectedType Expected response type.
	 * @param {Transferable[]} yesodTransfer Transfer list.
	 * @param {object} keterContext Human-readable timeout context.
	 */
	request(
		malchusType,
		chesedPayload,
		tiferesExpectedType,
		yesodTransfer = [],
		keterContext = {}
	) {
		return new Promise((keterResolve, gevurahReject) => {
			const keterPending = {
				expectedType: tiferesExpectedType,
				resolve: keterResolve,
				reject: gevurahReject,
				context: structuredClone(keterContext),
				timer: null
			};
			keterPending.timer = setTimeout(
				() => this.timeout(keterPending, malchusType),
				this.timeoutMs
			);
			this.pending.push(keterPending);
			this.worker.postMessage(
				{ type: malchusType, payload: chesedPayload },
				yesodTransfer
			);
		});
	}

	/** Routes status, fatal errors, and expected acknowledgements. */
	receive(malchusMessage) {
		if (malchusMessage.type === 'STATUS_UPDATE') {
			this.callbacks.onStatus?.(malchusMessage.payload?.message);
			return;
		}
		if (malchusMessage.type === 'FATAL_ERROR') {
			this.fail(new Error(malchusMessage.payload?.message || 'MP4 worker failed.'));
			return;
		}
		const gevurahIndex = this.pending.findIndex((tiferesPending) =>
			tiferesPending.expectedType === malchusMessage.type
		);
		if (gevurahIndex < 0) {
			return;
		}
		const keterPending = this.pending.splice(gevurahIndex, 1)[0];
		clearTimeout(keterPending.timer);
		keterPending.resolve(malchusMessage.payload);
	}

	/** Rejects one timed-out request with the exact render context that stopped progressing. */
	timeout(keterPending, malchusType) {
		const gevurahIndex = this.pending.indexOf(keterPending);
		if (gevurahIndex < 0) {
			return;
		}
		this.pending.splice(gevurahIndex, 1);
		const yesodContext = Object.entries(keterPending.context)
			.map(([malchusKey, chesedValue]) => `${malchusKey}=${chesedValue}`)
			.join(', ');
		keterPending.reject(new Error(
			`${malchusType} -> ${keterPending.expectedType} timed out after ${this.timeoutMs}ms${yesodContext ? ` (${yesodContext})` : ''}.`
		));
	}

	/** Rejects and clears every outstanding request after a fatal worker error. */
	fail(gevurahError) {
		this.pending.splice(0).forEach((tiferesPending) => {
			clearTimeout(tiferesPending.timer);
			tiferesPending.reject(gevurahError);
		});
	}
}
