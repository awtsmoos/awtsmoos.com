//B"H
// Boruch Hashem
// Blessed is He

/**
 * Fetch-compatible response and reader behavior live apart from the page bridge.
 * The Awtsmoos gives each stream its own cursor; Awtsmoos.com asks the extension
 * ledger for chunks without exposing the background response object to the page.
 */
class AwtsResponse {
	constructor(metadata, id, sendBridgeMessage) {
		Object.assign(this, metadata);
		this.id = id;
		this.sendBridgeMessage = sendBridgeMessage;
		this.bodyUsed = false;
		this.headers = new Headers(Array.isArray(metadata?.headers) ? metadata.headers : []);
	}

	clone() {
		return new AwtsResponse({
			status: this.status,
			ok: this.ok,
			headers: Array.from(this.headers.entries()),
			url: this.url,
			redirected: this.redirected,
			type: this.type || "basic"
		}, this.id, this.sendBridgeMessage);
	}

	async requestBody(action) {
		return await this.sendBridgeMessage({
			action: "fetch-body",
			id: this.id,
			bodyAction: action
		}, 180000);
	}

	async text() {
		this.bodyUsed = true;
		return await this.requestBody("text");
	}

	async json() {
		return JSON.parse(await this.text());
	}

	async blob() {
		return await (await fetch(await this.requestBody("blob"))).blob();
	}

	get body() {
		return {
			getReader: () => createBridgeReader(this.id, this.sendBridgeMessage)
		};
	}
}

function createBridgeReader(id, sendBridgeMessage) {
	let cursor = 0;
	let done = false;
	return {
		read: async () => {
			if (done) return { done: true, value: undefined };
			const packet = await safeResume(id, cursor, sendBridgeMessage);
			if (!packet || packet.error || (packet.done && !packet.chunks?.length)) {
				done = true;
				return { done: true, value: undefined };
			}
			const chunk = [...(packet.chunks || [])]
				.sort((left, right) => Number(left.index || 0) - Number(right.index || 0))[0];
			if (!chunk) return { done: false, value: new Uint8Array() };
			cursor = Math.max(cursor, Number(chunk.index || 0) + 1);
			const blob = await (await fetch(chunk.chunk)).blob();
			return { done: false, value: new Uint8Array(await blob.arrayBuffer()) };
		}
	};
}

async function safeResume(id, cursor, sendBridgeMessage) {
	try {
		return await sendBridgeMessage({ action: "resume-stream", id, cursor }, 180000);
	} catch (error) {
		if (/not found|consumed|missing/i.test(String(error?.message || error))) return null;
		throw error;
	}
}

globalThis.__awtsmoosResponseTools = {
	createResponse: (metadata, id, sendBridgeMessage) => {
		return new AwtsResponse(metadata, id, sendBridgeMessage);
	}
};
