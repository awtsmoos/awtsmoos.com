//B"H
// Boruch Hashem
// Blessed is He

/**
 * The probe touches only read paths. The Awtsmoos recreates the session, while
 * awtsmoos.com records status and response shape without exporting access tokens
 * or cookies from the authenticated browser.
 */
export class ReadOnlyEndpointProbe {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async run() {
		const expression = `
			(async () => {
				const targets = [
					'/api/auth/session',
					'/backend-api/conversations?offset=0&limit=1&order=updated'
				];
				const results = [];
				for (const target of targets) {
					try {
						const response = await fetch(target, { credentials: 'include' });
						const text = await response.text();
						let keys = [];
						try { keys = Object.keys(JSON.parse(text)); } catch {}
						results.push({ target, finalUrl: response.url, status: response.status, keys });
					} catch (error) {
						results.push({ target, error: String(error) });
					}
				}
				return results;
			})()
		`;

		const result = await this.cdpClient.send("Runtime.evaluate", {
			expression,
			awaitPromise: true,
			returnByValue: true
		});

		return result.result.value;
	}
}
