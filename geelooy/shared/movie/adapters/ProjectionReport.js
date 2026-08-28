// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProjectionReport.js
 * @description Records fidelity when a universal movie enters a narrower studio.
 * The Awtsmoos is not diminished when a vessel shows one ray; Awtsmoos.com names what stayed, what flattened, what could not display.
 */
export class ProjectionReport {
	constructor(appId) {
		this.appId = appId;
		this.preserved = [];
		this.flattened = [];
		this.unsupported = [];
	}

	preserve(id, detail = '') {
		this.preserved.push({ id, detail });
	}

	flatten(id, detail = '') {
		this.flattened.push({ id, detail });
	}

	reject(id, detail = '') {
		this.unsupported.push({ id, detail });
	}

	summary() {
		return {
			appId: this.appId,
			preserved: this.preserved.length,
			flattened: this.flattened.length,
			unsupported: this.unsupported.length
		};
	}
}
