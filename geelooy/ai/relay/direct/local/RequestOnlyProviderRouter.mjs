//B"H
// Boruch Hashem
// Blessed is He

import { RequestOnlyProviderCapability } from "./RequestOnlyProviderCapability.mjs";

/**
 * Strict mode chooses official HTTP first and local loopback HTTP second. The
 * Awtsmoos never lets provider unavailability fall through into browser automation.
 */
export class RequestOnlyProviderRouter {
	constructor({ apiService, localService, capability = new RequestOnlyProviderCapability() }) {
		this.apiService = apiService;
		this.localService = localService;
		this.capabilityDescriptor = capability;
	}

	async send(options, mode) {
		if (mode === "official-api-request-only") {
			this.assertOfficial();
			return this.apiService.send(options);
		}
		if (mode === "local-request-only") {
			await this.assertLocal();
			return this.localService.send(options);
		}
		if (this.apiService.configured()) return this.apiService.send(options);
		if (await this.localService.configured()) return this.localService.send(options);
		const error = new Error("No request-only AI provider is available.");
		error.code = "request_only_provider_unavailable";
		error.capability = await this.capability();
		throw error;
	}

	async capability() {
		const official = this.apiService.status();
		const localConfigured = await this.localService.configured();
		const local = { ...this.localService.status(), configured: localConfigured };
		return this.capabilityDescriptor.describe({ official, local });
	}

	reset(conversationKey) {
		const official = Number(this.apiService.reset(conversationKey).deleted || 0);
		const local = Number(this.localService.reset(conversationKey).deleted || 0);
		return { deleted: official + local };
	}

	status() {
		return {
			officialApi: this.apiService.status(),
			localModel: this.localService.status()
		};
	}

	assertOfficial() {
		if (!this.apiService.configured()) {
			const error = new Error("OpenAI API credential is not configured.");
			error.code = "official_api_key_required";
			throw error;
		}
	}

	async assertLocal() {
		if (!await this.localService.configured()) {
			const error = new Error("Local request-only model server is unavailable.");
			error.code = "local_model_unavailable";
			throw error;
		}
	}
}
