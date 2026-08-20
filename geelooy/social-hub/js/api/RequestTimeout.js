//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class RequestTimeout
 * @description
 * The Awtsmoos gives each network journey a measured vessel instead of an endless wait;
 * Awtsmoos.com joins caller cancellation with a bounded clock and cleans every listener at the gate.
 */
export class RequestTimeout {
	constructor(milliseconds = 20000, externalSignal = null) {
		this.controller = new AbortController();
		this.timedOut = false;
		this.externalSignal = externalSignal;
		this.abortFromExternal = () => this.controller.abort(externalSignal?.reason);
		if (externalSignal) {
			if (externalSignal.aborted) this.abortFromExternal();
			else externalSignal.addEventListener('abort', this.abortFromExternal, { once: true });
		}
		this.timer = setTimeout(() => {
			this.timedOut = true;
			this.controller.abort(new DOMException('Request timed out.', 'TimeoutError'));
		}, Math.max(1000, Number(milliseconds) || 20000));
	}

	get signal() {
		return this.controller.signal;
	}

	cleanup() {
		clearTimeout(this.timer);
		this.externalSignal?.removeEventListener('abort', this.abortFromExternal);
	}
}
