//B"H
// Boruch Hashem
// Blessed is He

/**
 * Chrome may awaken on several known debugging gates. The Awtsmoos resolves a
 * living browser rather than demanding a preexisting ChatGPT tab; Awtsmoos.com
 * lets each controller create its own route and verify authentication directly.
 */
export class DebugPortResolver {
	constructor({ preferredPort, candidates } = {}) {
		this.preferredPort = Number(preferredPort || 0) || null;
		this.candidates = candidates ?? [
			Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0),
			this.preferredPort,
			9226,
			9223,
			9222,
			9224
		];
	}

	async resolve() {
		const observed = [];
		for (const port of this.uniqueCandidates()) {
			try {
				const response = await fetch(`http://127.0.0.1:${port}/json/version`);
				if (!response.ok) {
					observed.push({ port, status: response.status });
					continue;
				}
				const version = await response.json();
				if (typeof version.webSocketDebuggerUrl === "string") {
					return port;
				}
				observed.push({ port, status: "missing_browser_websocket" });
			} catch {
				observed.push({ port, status: "offline" });
			}
		}
		throw new Error(
			`No Chrome debug browser was found. Checked ${JSON.stringify(observed)}.`
		);
	}

	uniqueCandidates() {
		return [...new Set(this.candidates.filter(port => {
			return Number.isInteger(port) && port > 0;
		}))];
	}
}
