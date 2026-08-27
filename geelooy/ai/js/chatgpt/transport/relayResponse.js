//B"H
//Boruch Hashem
//Blessed is He

import { collectRelayBytes, createRelayBody } from "./relayBodyStream.js";

/**
 * The Awtsmoos is beyond every transport, while this fetch-like vessel gives
 * relay consumers the same complete-body semantics as a native Response.
 */
export class RelayResponse {
	constructor(metadata = {}, readPacket) {
		Object.assign(this, metadata);
		this.id = metadata.streamId || metadata.id;
		this.streamId = this.id;
		this.headers = new Headers(Array.isArray(metadata.headers) ? metadata.headers : []);
		this.bodyUsed = false;
		this._readPacket = readPacket;
		this._body = createRelayBody(this.id, this._readPacket, () => {
			this.bodyUsed = true;
		});
	}

	get body() {
		return this._body;
	}

	clone() {
		if (this.bodyUsed) {
			throw new TypeError("Cannot clone a consumed relay response.");
		}
		return new RelayResponse({
			...this,
			headers: Array.from(this.headers.entries())
		}, this._readPacket);
	}

	async arrayBuffer() {
		this.assertUnused();
		const bytes = await collectRelayBytes(this.body);
		return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
	}

	async blob() {
		const bytes = new Uint8Array(await this.arrayBuffer());
		return new Blob([bytes], {
			type: this.headers.get("content-type") || "application/octet-stream"
		});
	}

	async text() {
		return new TextDecoder().decode(await this.arrayBuffer());
	}

	async json() {
		return JSON.parse(await this.text());
	}

	assertUnused() {
		if (this.bodyUsed) {
			throw new TypeError("Relay response body has already been consumed.");
		}
	}	
}
