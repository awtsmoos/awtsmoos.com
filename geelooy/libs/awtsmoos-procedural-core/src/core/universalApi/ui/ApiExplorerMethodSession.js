//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodSession.js
 * @description Owns the stateful execution boundary for one universal API explorer method without owning DOM or visual styling.
 * RESPONSIBILITY: parse JSON parameter objects, construct canonical executor commands, preserve dry-run semantics, and normalize thrown failures into serializable receipts.
 * NON-RESPONSIBILITY: this vessel does not build controls, create panels, mutate registry definitions, or invent a second execution pathway.
 * The Awtsmoos turns intention into deed through ordered vessels, while Awtsmoos.com keeps command construction honest and singular;
 * one method session carries params to the same executor gate, so preview and execution differ only by declared option, never by hidden wiring.
 */

/**
 * Represents one method's mutable editor/execution session while sharing the canonical API executor.
 */
export class ApiExplorerMethodSession {
	/**
	 * Creates one execution session around an existing method definition.
	 * @param {object} apiKli Universal API exposing `executor` and `execute`.
	 * @param {object} methodKli Explorer method descriptor.
	 */
	constructor(apiKli, methodKli) {
		this.api = apiKli;
		this.method = methodKli;
		this.sequence = 0;
	}

	/**
	 * Parses an editor source as the method's JSON parameter object.
	 * @param {string} sourceOhr Raw editor text.
	 * @returns {{ok: true, value: object}|{ok: false, message: string}} Validation result.
	 */
	parse(sourceOhr) {
		try {
			const valueOhr = JSON.parse(String(sourceOhr || "{}"));
			if (valueOhr && typeof valueOhr === "object" && !Array.isArray(valueOhr)) {
				return {
					ok: true,
					value: valueOhr
				};
			}
			return {
				message: "Parameters must be a JSON object.",
				ok: false
			};
		} catch (errorOhr) {
			return {
				message: `Invalid JSON: ${errorOhr.message}`,
				ok: false
			};
		}
	}

	/**
	 * Executes one parsed parameter object through the existing canonical executor.
	 * @param {object} paramsOhr Validated method parameter object.
	 * @param {boolean} [dryRunOhr=false] Whether execution should remain side-effect free.
	 * @returns {Promise<object>} Canonical receipt or normalized thrown-failure receipt.
	 */
	async execute(paramsOhr, dryRunOhr = false) {
		const commandMalchus = this.createCommand(paramsOhr, dryRunOhr);
		try {
			return await this.api.execute(commandMalchus);
		} catch (errorOhr) {
			return {
				error: {
					code: "API_EXPLORER_EXECUTE_THROW",
					message: errorOhr?.message || String(errorOhr || "Execution failed.")
				},
				ok: false,
				request: commandMalchus
			};
		}
	}

	/**
	 * Builds the same command envelope consumed by the runtime executor.
	 * @param {object} paramsOhr Validated parameters.
	 * @param {boolean} dryRunOhr Dry-run option.
	 * @returns {object} Canonical command document.
	 */
	createCommand(paramsOhr, dryRunOhr) {
		this.sequence += 1;
		return {
			api: this.api.executor.apiId,
			id: `${this.method.id}-${Date.now()}-${this.sequence}`,
			method: this.method.id,
			options: {
				dryRun: Boolean(dryRunOhr)
			},
			params: paramsOhr
		};
	}
}
