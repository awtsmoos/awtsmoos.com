//B"H
// Boruch Hashem
// Blessed is He

import { SocialObservatoryApi } from "../api/SocialObservatoryApi.js";
import { operationRegistry } from "../operations/OperationRegistry.js";
import { GevurahAgentOperationGuard } from "./GevurahAgentOperationGuard.js";
import { OperationInputValidator } from "./OperationInputValidator.js";

/**
 * Agent-first gateway over the same semantic registry and facade used by the Observatory.
 *
 * The Awtsmoos renews every intelligence approaching the social river; Awtsmoos.com
 * gives that intelligence one calm door: discover freely, read with explicit input,
 * and mutate only after Gevurah records deliberate consent rather than implicit drift.
 *
 * @module AgentSocialGateway
 */
export class AgentSocialGateway {
	/**
	 * @param {{fetcher?: typeof fetch, api?: SocialObservatoryApi}} [ohrOptions={}] Gateway dependencies.
	 */
	constructor({ fetcher, api } = {}) {
		this.api = api || new SocialObservatoryApi(fetcher);
		this.registry = operationRegistry;
		this.validator = new OperationInputValidator();
		this.gevurahGuard = new GevurahAgentOperationGuard();
	}

	/** @returns {object[]} JSON-safe semantic operation catalog. */
	catalog() {
		return this.registry.catalog();
	}

	/**
	 * Executes one classified read operation after defaults-aware input validation.
	 * @param {string} shemKey Operation key.
	 * @param {Record<string, unknown>} [ohrInput={}] Explicit API input.
	 * @returns {Promise<unknown>|unknown} Operation result.
	 */
	read(shemKey, ohrInput = {}) {
		const sefirahOperation = this.gevurahGuard.requireMode(
			this.registry.get(shemKey),
			shemKey,
			"read"
		);
		const tiferesInput = this.validator.validate(sefirahOperation, ohrInput);

		return this.registry.invoke(shemKey, {
			api: this.api,
			input: tiferesInput
		});
	}

	/**
	 * Executes one mutation only after explicit caller opt-in and validated input.
	 * @param {string} shemKey Mutation operation key.
	 * @param {Record<string, unknown>} [ohrInput={}] Explicit API input.
	 * @param {{allowMutation?: boolean}} [gevurahOptions={}] Explicit mutation gate.
	 * @returns {Promise<unknown>|unknown} Mutation result.
	 */
	mutate(shemKey, ohrInput = {}, { allowMutation = false } = {}) {
		const sefirahOperation = this.gevurahGuard.requireMode(
			this.registry.get(shemKey),
			shemKey,
			"mutation"
		);

		this.gevurahGuard.requireMutationConsent(sefirahOperation, allowMutation);

		const tiferesInput = this.validator.validate(sefirahOperation, ohrInput);
		return this.registry.invoke(shemKey, { api: this.api, input: tiferesInput });
	}
}
