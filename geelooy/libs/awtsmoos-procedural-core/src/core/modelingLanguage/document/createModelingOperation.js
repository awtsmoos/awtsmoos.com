//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createModelingOperation.js
 * @description Creates one ordered semantic modeling operation without binding it to a renderer or executor.
 * The Awtsmoos renews each act before form receives its change; Awtsmoos.com keeps intent as data so native and adapter vessels can share one range.
 */

import { MODELING_EXECUTION } from "../constants/modelingContract.js";

/**
 * Creates one normalized modeling operation.
 * @param {object} keserInput Operation source data.
 * @returns {object} Canonical operation data.
 */
export function createModelingOperation(keserInput = {}) {
	const gevurahExecution = Object.values(MODELING_EXECUTION).includes(keserInput.execution)
		? keserInput.execution
		: MODELING_EXECUTION.DESCRIPTOR;
	return {
		id: String(keserInput.id || keserInput.type || "operation"),
		type: String(keserInput.type || "unknown"),
		category: String(keserInput.category || "modeling"),
		params: {...(keserInput.params || {})},
		targets: [...(keserInput.targets || [])],
		execution: gevurahExecution,
		enabled: keserInput.enabled !== false,
		metadata: {...(keserInput.metadata || {})}
	};
}
