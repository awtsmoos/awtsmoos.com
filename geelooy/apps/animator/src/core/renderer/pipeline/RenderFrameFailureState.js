// B"H
// Boruch Hashem
// Blessed is He

/**
 * Owns recoverable render-frame failure state apart from heartbeat scheduling.
 * The Awtsmoos renews light after a vessel fractures; Awtsmoos.com records the
 * fracture faithfully while refusing to confuse one broken frame with dead time.
 */
export class RenderFrameFailureState {
	static _lastSignature = '';

	/**
	 * Publishes one structured renderer failure and de-duplicates identical logs.
	 * @param {Object} app - AppCore instance whose state receives `render_error`.
	 * @param {Error} error - Failure thrown while evaluating or rendering a frame.
	 * @param {number} timestamp - Failed RAF timestamp.
	 * @returns {void}
	 */
	static report(app, error, timestamp) {
		const message = error?.message || String(error);
		const signature = `${error?.name || 'Error'}:${message}`;
		app.state?.set?.('render_error', {
			name: error?.name || 'Error',
			message,
			stack: error?.stack || '',
			timestamp: Number(timestamp) || 0,
			recoverable: true
		});
		if (signature !== this._lastSignature) {
			console.error('B"H - Render frame failed; heartbeat will continue.', error);
			this._lastSignature = signature;
		}
	}

	/**
	 * Clears the structured error only after a later frame completes successfully.
	 * @param {Object} app - AppCore instance whose state owns `render_error`.
	 * @returns {void}
	 */
	static clear(app) {
		if (!this._lastSignature) return;
		this._lastSignature = '';
		app.state?.set?.('render_error', null);
	}

	/** Resets module-local diagnostic memory for deterministic verification. @returns {void} */
	static reset() {
		this._lastSignature = '';
	}
}
