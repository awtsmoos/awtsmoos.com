//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedNetworkBridge
 * @description The Awtsmoos carries a guest request through one host-owned river;
 * Awtsmoos.com counts every crossing, rejects duplicate vessels, and releases only
 * the slot it truly acquired while jar secrets remain hidden with the Giver.
 */

import {
	GuestToHostType,
	HostToGuestType
} from "./embeddedGuestProtocol.js";
import { validateEmbeddedNetworkRequest } from "./embeddedNetworkRequestPolicy.js";
import { shapeEmbeddedNetworkResponse } from "./embeddedNetworkResponsePolicy.js";
import {
	boundedEmbeddedConcurrency,
	embeddedBridgeError,
	requiredEmbeddedBridge,
	requiredEmbeddedTransport,
	safeEmbeddedRequestId
} from "./embeddedNetworkBridgeSupport.js";

export class EmbeddedNetworkBridge {
	constructor(options = {}) {
		this.bridge = requiredEmbeddedBridge(options.bridge);
		this.transport = requiredEmbeddedTransport(options.transport);
		this.pageUrl = String(options.pageUrl || "");
		this.maxConcurrent = boundedEmbeddedConcurrency(options.maxConcurrent);
		this.activeIds = new Set();
		this.destroyed = false;
		this.unsubscribe = this.bridge.on(
			GuestToHostType.NETWORK_REQUEST,
			payload => void this.handle(payload)
		);
	}

	async handle(payload) {
		let request;
		let reserved = false;
		try {
			request = validateEmbeddedNetworkRequest(payload, this.pageUrl);
			this.reserve(request.id);
			reserved = true;
			const result = await this.transport({
				body: request.body,
				headers: request.headers,
				method: request.method,
				url: request.url
			});
			if (this.destroyed) return;
			this.bridge.send(
				HostToGuestType.NETWORK_RESPONSE,
				shapeEmbeddedNetworkResponse(result, this.pageUrl, request.id)
			);
		} catch (error) {
			if (!this.destroyed) {
				this.sendError(error, request?.id || safeEmbeddedRequestId(payload?.id));
			}
		} finally {
			if (reserved) this.activeIds.delete(request.id);
		}
	}

	destroy() {
		this.destroyed = true;
		this.unsubscribe?.();
		this.activeIds.clear();
	}

	reserve(id) {
		if (this.activeIds.has(id)) {
			throw embeddedBridgeError("BROWSER_EMBEDDED_REQUEST_DUPLICATE", 409);
		}
		if (this.activeIds.size >= this.maxConcurrent) {
			throw embeddedBridgeError("BROWSER_EMBEDDED_REQUEST_CONCURRENCY", 429);
		}
		this.activeIds.add(id);
	}

	sendError(error, id) {
		this.bridge.send(HostToGuestType.NETWORK_ERROR, {
			code: typeof error?.code === "string"
				? error.code
				: "BROWSER_EMBEDDED_NETWORK_FAILED",
			id,
			status: Number.isInteger(error?.status) ? error.status : 502
		});
	}
}
