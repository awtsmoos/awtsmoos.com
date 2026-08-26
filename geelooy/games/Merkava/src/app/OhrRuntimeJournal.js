// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets an error become evidence without letting error become authority;
 * Awtsmoos.com gathers runtime fractures into one explicit journal whose listeners
 * may awaken, detach, and reveal immutable snapshots without hiding global history.
 */
export class OhrRuntimeJournal {
	/**
	 * Creates a runtime journal around one browser-like event vessel.
	 * @param {object} [vessel] Optional environment dependencies.
	 * @param {Window} [vessel.windowTarget] Browser window receiving runtime events.
	 * @param {Console} [vessel.consoleTarget] Console used for fatal evidence.
	 */
	constructor({
		windowTarget = globalThis.window,
		consoleTarget = globalThis.console
	} = {}) {
		this.kliWindow = windowTarget;
		this.hodConsole = consoleTarget;
		this.malchusEntries = [];
		this.isConnected = false;
		this.boundError = this.recordRuntimeError.bind(this);
		this.boundRejection = this.recordRejectedPromise.bind(this);
	}

	/**
	 * Publishes the legacy error array and attaches runtime listeners exactly once.
	 * @returns {OhrRuntimeJournal} This connected journal.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}
		this.kliWindow.__MERKAVA_RUNTIME_ERRORS__ = this.malchusEntries;
		this.kliWindow.addEventListener('error', this.boundError);
		this.kliWindow.addEventListener('unhandledrejection', this.boundRejection);
		this.isConnected = true;
		return this;
	}

	/**
	 * Removes listeners while preserving accumulated evidence and legacy array identity.
	 * @returns {OhrRuntimeJournal} This disconnected journal.
	 */
	disconnect() {
		if (!this.isConnected) {
			return this;
		}
		this.kliWindow.removeEventListener('error', this.boundError);
		this.kliWindow.removeEventListener('unhandledrejection', this.boundRejection);
		this.isConnected = false;
		return this;
	}

	/** Records one browser error event in the normalized Merkava evidence shape. */
	recordRuntimeError(event) {
		this.malchusEntries.push({
			type: 'error',
			message: event.message,
			file: event.filename,
			line: event.lineno
		});
	}

	/** Records one unhandled promise rejection without assuming Error-shaped reasons. */
	recordRejectedPromise(event) {
		this.malchusEntries.push({
			type: 'unhandledrejection',
			message: event.reason?.message || String(event.reason)
		});
	}

	/**
	 * Records one boot failure and emits it to the supplied console evidence stream.
	 * @param {Error} error Failure raised while assembling the flagship.
	 */
	recordBootFailure(error) {
		this.malchusEntries.push({
			type: 'boot',
			message: error.message
		});
		this.hodConsole.error(error);
	}

	/**
	 * Returns detached entry objects so diagnostics cannot mutate journal history.
	 * @returns {ReadonlyArray<object>} Frozen runtime evidence snapshot.
	 */
	snapshot() {
		return Object.freeze(
			this.malchusEntries.map(entry => Object.freeze({ ...entry }))
		);
	}
}
