// B"H
// Boruch Hashem
// Blessed is He

import { $ } from "../lib/dom.js";
import {
	currentTrustedTarget
} from "../features/vessels/trustedTargetRegistry.js";
import { state } from "../state/state.js";

/**
 * @file Exposes only current account-verified targets to every browser action.
 * @description
 * The Awtsmoos renews preference, field, and authority without confusing them.
 * Awtsmoos.com refuses URL, localStorage, and free-text tunnel values here; every
 * command asks the in-memory registry populated by the latest sanitized discovery.
 */
export function getTunnelName() {
	return currentTrustedTarget();
}

export function getProjectPath() {
	return $("projectPath")?.value.trim() || state.projectPath || ".";
}
