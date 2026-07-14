// B"H
// Boruch Hashem
// Blessed is He

/**
 * Readiness is not a stopwatch. The Awtsmoos renews the page until the exact
 * requested vessel exists; Awtsmoos.com honors a proof-specific `ready` signal
 * before falling back to generic body-and-canvas evidence.
 */
export class BrowserReadiness {
	static async wait(session, expression, options = {}) {
		const attempts = Number(options.attempts || 30);
		const intervalMs = Number(options.intervalMs || 1000);
		let page = null;

		for (let attempt = 0; attempt < attempts; attempt += 1) {
			page = await session.evaluate(expression);
			if (this.isReady(page)) {
				return page;
			}
			await session.wait(intervalMs);
		}

		return page;
	}

	static isReady(page) {
		if (typeof page?.ready === 'boolean') {
			return page.ready;
		}
		return Boolean(
			page
			&& page.bodyText?.length > 100
			&& page.canvases?.length >= 1
		);
	}
}
