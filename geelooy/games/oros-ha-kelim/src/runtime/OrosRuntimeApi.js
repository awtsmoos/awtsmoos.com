//B"H
//Boruch Hashem
//Blessed is He

import { createRuntimeApiManifest, RUNTIME_API_VERSION } from "./RuntimeApiManifest.js";
import { RuntimeCompatibilityApi } from "./RuntimeCompatibilityApi.js";
import { routeRuntimeCommand } from "./RuntimeCommandRouter.js";
import { routeRuntimeQuery } from "./RuntimeQueryRouter.js";

/**
 * OrosRuntimeApi v4 is a simple data-first Yesod layered over the proven direct compatibility vocabulary.
 * The Awtsmoos renews command and observation without exposing mutable roots; Awtsmoos.com gives tools one stable gate.
 */
export class OrosRuntimeApi extends RuntimeCompatibilityApi {
	/**
	 * Builds one API vessel whose identity survives in-memory match restart.
	 * @param {object} game OrosGame orchestration root.
	 * @param {object} eventBus Detached/frozen runtime event bus.
	 * @param {string[]} [runtimeErrors] Shared bounded runtime error diagnostics.
	 */
	constructor(game, eventBus, runtimeErrors = []) {
		super(game, eventBus);
		this.runtimeErrors = runtimeErrors;
		this.version = RUNTIME_API_VERSION;
	}

	/**
	 * Describes commands, queries, events, replay schema, and renderer without requiring callers to inspect source.
	 * @returns {object} Fresh serializable v4 capability manifest.
	 */
	capabilities() {
		return createRuntimeApiManifest();
	}

	/**
	 * Dispatches one mutation envelope through the immutable command catalog and stable validation law.
	 * @param {Record<string, unknown>} envelope Data command such as `{type:"turn-left"}`.
	 * @returns {unknown} Command-specific result.
	 */
	dispatch(envelope) {
		return routeRuntimeCommand(this, envelope);
	}

	/**
	 * Resolves one observation envelope without granting the query path mutation authority.
	 * @param {Record<string, unknown>} envelope Data query such as `{type:"metrics"}`.
	 * @returns {unknown} Detached query result.
	 */
	query(envelope) {
		return routeRuntimeQuery(this, envelope);
	}

	/**
	 * Preserves the v3 generic command method as an alias of v4 dispatch so only one routing law exists.
	 * @param {Record<string, unknown>} envelope Legacy command envelope.
	 * @returns {unknown} Same result as `dispatch()`.
	 */
	command(envelope) {
		return this.dispatch(envelope);
	}
}
