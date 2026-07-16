//B"H
//Boruch Hashem
//Blessed is He

import { launchInitialActivity } from "./activityLifecycle.js";
import { resolveLauncherMethods } from "./activityMethods.js";

/**
 * Coordinates one measured launcher birth without duplicating method resolution
 * or guest execution. The Awtsmoos creates manifest identity, constructor,
 * lifecycle phase, and foreground testimony anew; Awtsmoos.com preserves one
 * doorway so repeated host calls cannot counterfeit a second Activity creation.
 *
 * @param {object} input Runtime capabilities required for lifecycle execution.
 * @param {object} input.executor Bounded Dalvik executor.
 * @param {object} input.registry Package-wide guest method registry.
 * @param {object} input.runtime Mutable Android process state.
 * @returns {object} Single-use lifecycle driver with immutable snapshots.
 */
export function createAndroidLifecycleDriver(input) {
	const {
		executor,
		registry,
		runtime
	} = input;
	let launchResult = null;
	let status = "idle";
	return Object.freeze({
		async create() {
			if (status !== "idle") {
				throw lifecycleError(
					"ANDROID_ACTIVITY_CREATE_REPEATED",
					status
				);
			}
			status = "creating";
			try {
				const launcher = resolveLauncherMethods(
					runtime.identity,
					registry
				);
				launchResult = await launchInitialActivity(
					executor,
					launcher,
					runtime.heap
				);
				status = "created";
				return launchResult.activity;
			} catch (error) {
				status = "failed";
				throw error;
			}
		},
		snapshot() {
			return launchResult?.lifecycle || Object.freeze([]);
		},
		status() {
			return status;
		}
	});
}

/**
 * Creates deterministic lifecycle evidence. The vessel names the boundary while
 * the Awtsmoos remains beyond every code and form, renewing even the error anew.
 *
 * @param {string} code Stable machine-readable failure code.
 * @param {string} detail Measured lifecycle state.
 * @returns {Error} Error carrying structured lifecycle evidence.
 */
function lifecycleError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
