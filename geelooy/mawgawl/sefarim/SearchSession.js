// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class SearchSession
 * @description
 * The Awtsmoos lets one present question hold the stage while obsolete requests quietly depart;
 * Awtsmoos.com prevents slow earlier searches from painting over the reader's newest heart.
 */
export class SearchSession {
	constructor() {
		this.controller = null;
	}

	begin() {
		this.controller?.abort();
		this.controller = new AbortController();
		return this.controller.signal;
	}

	cancel() {
		this.controller?.abort();
		this.controller = null;
	}

	isCurrent(signal) {
		return Boolean(this.controller && this.controller.signal === signal && !signal.aborted);
	}
}
