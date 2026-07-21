// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos grants no hidden authority; every permission enters through a named gate.
 * This Awtsmoos.com policy vessel remains deterministic and default-deny.
 */

import { createDiagnostic } from "../diagnostics/index.js";
import {
	PLUGIN_EXECUTION_MODES,
	PLUGIN_TRUST_LEVELS,
	assertPluginChoice,
	normalizePluginIdentifiers
} from "./pluginContract.js";

function createPolicyDiagnostic(code, message, metadata) {
	return createDiagnostic({
		code,
		message,
		metadata
	});
}

export function evaluatePluginPermissions(manifest, options = {}) {
	const granted = normalizePluginIdentifiers(options.grantedPermissions ?? [], "Granted permissions");
	const grantedSet = new Set(granted);
	const denied = Object.freeze(manifest.permissions.filter(permission => !grantedSet.has(permission)));
	const minimumTrustLevel = assertPluginChoice(
		options.minimumTrustLevel ?? "untrusted",
		PLUGIN_TRUST_LEVELS,
		"minimum trust level"
	);
	const allowedExecutionModes = options.allowedExecutionModes ?? PLUGIN_EXECUTION_MODES;
	if (!Array.isArray(allowedExecutionModes)) {
		throw new TypeError("Allowed execution modes must be an array.");
	}
	for (const mode of allowedExecutionModes) {
		assertPluginChoice(mode, PLUGIN_EXECUTION_MODES, "allowed execution mode");
	}
	const trustAccepted = PLUGIN_TRUST_LEVELS.indexOf(manifest.trustLevel)
		>= PLUGIN_TRUST_LEVELS.indexOf(minimumTrustLevel);
	const executionModeAccepted = allowedExecutionModes.includes(manifest.executionMode);
	const diagnostics = [];
	if (denied.length) {
		diagnostics.push(createPolicyDiagnostic(
			"PLUGIN.PERMISSION_DENIED",
			"One or more requested plugin permissions were not granted.",
			{ denied }
		));
	}
	if (!trustAccepted) {
		diagnostics.push(createPolicyDiagnostic(
			"PLUGIN.TRUST_INSUFFICIENT",
			"The plugin trust level is below host policy.",
			{ actual: manifest.trustLevel, required: minimumTrustLevel }
		));
	}
	if (!executionModeAccepted) {
		diagnostics.push(createPolicyDiagnostic(
			"PLUGIN.EXECUTION_MODE_DENIED",
			"The plugin execution mode is not allowed by host policy.",
			{ actual: manifest.executionMode }
		));
	}
	return Object.freeze({
		ok: denied.length === 0 && trustAccepted && executionModeAccepted,
		requested: manifest.permissions,
		granted,
		denied,
		trustAccepted,
		executionModeAccepted,
		diagnostics: Object.freeze(diagnostics)
	});
}
