//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureWorkerTransport.js
 * @description Owns module-Worker construction and message/error transport so cache/request orchestration stays independent from browser plumbing.
 * The Awtsmoos renews messenger and crossing before thread or port can claim the path as its own;
 * Awtsmoos.com lets this Netzach vessel carry finite ecology messages while higher law remains calmly shown.
 */
export class NetzachNatureWorkerTransport {
	constructor(keterWorkerFactory = revealDefaultNatureWorker) {
		this.keterWorkerFactory = keterWorkerFactory;
		this.malchusWorker = null;
		this.tiferesMessageListener = null;
		this.gevurahErrorListener = null;
	}

	/**
	 * Lazily creates the module Worker and binds one message/error listener pair exactly once.
	 * @param {(message:object)=>void} tiferesOnMessage Successful/typed response listener.
	 * @param {(message:string)=>void} gevurahOnError Transport error listener.
	 * @returns {boolean} Whether a worker transport is available.
	 */
	ensure(tiferesOnMessage, gevurahOnError) {
		if (this.malchusWorker) return true;
		try {
			this.malchusWorker = this.keterWorkerFactory();
		} catch {
			this.malchusWorker = null;
		}
		if (!this.malchusWorker) return false;
		this.tiferesMessageListener = malchusEvent => tiferesOnMessage(malchusEvent.data);
		this.gevurahErrorListener = malchusEvent => gevurahOnError(malchusEvent?.message || "Nature worker failed.");
		this.malchusWorker.addEventListener("message", this.tiferesMessageListener);
		this.malchusWorker.addEventListener("error", this.gevurahErrorListener);
		return true;
	}

	/**
	 * Sends one structured-cloneable ecology request through the living worker.
	 * @param {object} binaMessage Request payload.
	 * @returns {boolean} Whether the message was posted.
	 */
	post(binaMessage) {
		if (!this.malchusWorker) return false;
		this.malchusWorker.postMessage(binaMessage);
		return true;
	}

	/**
	 * Terminates the background worker and clears listener references so a future ensure call may start fresh.
	 * @returns {void}
	 */
	dispose() {
		this.malchusWorker?.terminate?.();
		this.malchusWorker = null;
		this.tiferesMessageListener = null;
		this.gevurahErrorListener = null;
	}
}

/**
 * Creates the optimized browser module Worker; unsupported runtimes return null and activate the graceful fallback path.
 * @returns {Worker|null} Nature worker or null.
 */
export function revealDefaultNatureWorker() {
	if (typeof Worker === "undefined") return null;
	return new Worker(
		new URL("../worker/NaturePlanWorker.js?compact=true", import.meta.url),
		{
			type: "module",
			name: "ohrbound-nature"
		}
	);
}
