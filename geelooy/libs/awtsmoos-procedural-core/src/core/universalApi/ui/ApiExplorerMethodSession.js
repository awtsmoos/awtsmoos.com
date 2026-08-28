//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodSession.js
 * @description Owns the stateful command boundary for one Universal API Explorer method while preserving the canonical Universal executor as the only execution pathway.
 * RESPONSIBILITY: parse editor JSON objects, construct command envelopes, preserve dry-run semantics, sequence local request ids, and normalize thrown executor failures into serializable receipts.
 * NON-RESPONSIBILITY: this vessel never builds DOM, styles controls, groups panels, mutates registry definitions, or creates an alternate transport/execution engine.
 * The Awtsmoos renews intention before text can become command and command can descend toward deed;
 * Awtsmoos.com lets one session carry parameters through the established executor, so preview and action share one lawful seed.
 */

/** Represents one method's editor/execution session while sharing the canonical Universal executor. */
export class ApiExplorerMethodSession {
	/**
	 * @description Creates one method-local session around an existing Universal API and detached Explorer method descriptor.
	 * @param {object} apiKli Universal API exposing `executor.apiId` and asynchronous `execute(command)`.
	 * @param {object} methodKli Detached Explorer method model whose stable `id` becomes the command method name.
	 * @throws {TypeError} Throws when the API or method does not expose the minimal command-construction contract.
	 */
	constructor(apiKli, methodKli) {
		if (!apiKli?.executor?.apiId || typeof apiKli.execute !== "function") {
			throw new TypeError('B"H | API Explorer method session requires a Universal API executor.');
		}
		if (!methodKli?.id) {
			throw new TypeError('B"H | API Explorer method session requires a method id.');
		}
		this.api = apiKli;
		this.method = methodKli;
		this.sequence = 0;
	}

	/**
	 * @description Parses raw editor text as one JSON parameter object, rejecting arrays/scalars before Universal schema validation begins.
	 * @param {string} sourceOhr Raw textarea source supplied by the user.
	 * @returns {{ok: true, value: object}|{ok: false, message: string}} Local parse result containing either a parameter object or concise validation message.
	 */
	parse(sourceOhr) {
		try {
			const valueOhr = JSON.parse(String(sourceOhr || "{}"));
			if (valueOhr && typeof valueOhr === "object" && !Array.isArray(valueOhr)) {
				return { ok: true, value: valueOhr };
			}
			return {
				message: "Parameters must be a JSON object.",
				ok: false
			};
		} catch (errorGevurah) {
			return {
				message: `Invalid JSON: ${errorGevurah.message}`,
				ok: false
			};
		}
	}

	/**
	 * @description Sends one validated parameter object through the existing Universal executor and converts only thrown transport/executor exceptions into portable Explorer receipts.
	 * @param {object} paramsKli Locally parsed parameter object; canonical schema validation still belongs to Universal execution.
	 * @param {boolean} [dryRunOhr=false] Whether Universal should validate/preview according to its existing dry-run contract.
	 * @returns {Promise<object>} Canonical Universal receipt or a serializable failure receipt when `api.execute()` throws instead of returning one.
	 */
	async execute(paramsKli, dryRunOhr = false) {
		const commandMalchus = this.createCommand(paramsKli, dryRunOhr);
		try {
			return await this.api.execute(commandMalchus);
		} catch (errorGevurah) {
			return {
				error: {
					code: "API_EXPLORER_EXECUTE_THROW",
					message: errorGevurah?.message || String(errorGevurah || "Execution failed.")
				},
				ok: false,
				request: commandMalchus
			};
		}
	}

	/**
	 * @description Builds the exact command envelope consumed by the Universal executor while providing a method-local unique request id for repeated Explorer actions.
	 * @param {object} paramsKli Locally parsed parameter object passed unchanged to Universal schema validation.
	 * @param {boolean} dryRunOhr Dry-run intent reflected into the canonical command options object.
	 * @returns {object} Command document containing api id, unique request id, method id, options, and params.
	 * @sideEffect Increments only this session's local sequence counter; no Universal/world state is mutated here.
	 */
	createCommand(paramsKli, dryRunOhr) {
		this.sequence += 1;
		return {
			api: this.api.executor.apiId,
			id: `${this.method.id}-${Date.now()}-${this.sequence}`,
			method: this.method.id,
			options: {
				dryRun: Boolean(dryRunOhr)
			},
			params: paramsKli
		};
	}
}
