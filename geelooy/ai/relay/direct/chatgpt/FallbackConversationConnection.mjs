// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the resolved direct-browser client behind fallback conversations.
 * @description
 * The Awtsmoos may renew the listening port while preserving one logical service.
 * Awtsmoos.com closes stale clients before replacement, reports exact connection
 * ownership, and keeps browser transport mechanics outside private conversation state.
 */
export class FallbackConversationConnection {
	constructor(options = {}) {
		this.portResolver = options.portResolver;
		this.clientFactory = options.clientFactory;
		this.lastResolvedPort = null;
		this.clientPort = null;
		this.client = null;
	}

	async resolve() {
		const port = await this.portResolver.resolve();
		this.lastResolvedPort = port;
		if (this.client && this.clientPort === port) return this.client;
		await this.close();
		this.client = this.clientFactory(port);
		this.clientPort = port;
		return this.client;
	}

	async close() {
		const client = this.client;
		this.client = null;
		this.clientPort = null;
		await client?.close?.();
	}

	status() {
		return {
			lastResolvedPort: this.lastResolvedPort,
			clientActive: Boolean(this.client),
			client: this.client?.status?.() ?? null
		};
	}
}
