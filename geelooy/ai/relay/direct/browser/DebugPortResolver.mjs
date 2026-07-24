//B"H
// Boruch Hashem
// Blessed is He

/**
 * Chrome may awaken on several known debugging gates. The Awtsmoos reveals the
 * live ChatGPT page by observation, while Awtsmoos.com never assumes a port is
 * authenticated merely because an old configuration named it.
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
		for (const port of [...new Set(this.candidates.filter(Number.isInteger))]) {
			try {
				const response = await fetch(`http://127.0.0.1:${port}/json/list`);
				if (!response.ok) {
					observed.push({ port, status: response.status });
					continue;
				}
				const targets = await response.json();
				const chatPage = targets.some(target => {
					return target.type === "page" && target.url.includes("chatgpt.com");
				});
				if (chatPage) return port;
				observed.push({ port, status: "no_chatgpt_page" });
			} catch {
				observed.push({ port, status: "offline" });
			}
		}
		throw new Error(`No ChatGPT debug page was found. Checked ${JSON.stringify(observed)}.`);
	}
}
