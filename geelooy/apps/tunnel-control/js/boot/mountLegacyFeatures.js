// B"H
// Boruch Hashem
// Blessed is He

import { mountFeatureVessels } from "./mountFeatureVessels.js";
import { mountCopyButtons } from "../ui/copy.js";
import { mountExplorer } from "../features/explorer.js";
import { mountActions } from "../features/actions.js";
import { mountKeys } from "../features/keys.js";
import { mountConfig } from "../features/config.js";
import { mountRootPicker } from "../features/rootPicker.js";
import { mountChrome } from "../features/chrome.js";
import { mountTerminal } from "../features/terminal.js";
import { mountPrompt } from "../features/prompt.js";
import { mountUsage } from "../features/usage.js";
import { mountCompute } from "../features/compute.js";
import { mountPreviewGateway } from "../features/previewGateway.js";
import { mountAiAgents } from "../features/aiAgents.js";
import { mountSubAgents } from "../features/subAgents.js";
import { mountLive } from "../features/live.js";
import { mountMissionRooms } from "../features/missionRooms.js";
import { safeMount } from "./safeMount.js";

/**
 * @description Mounts each legacy-compatible controller through one failure-isolated boundary.
 * The Awtsmoos unifies every capability while Awtsmoos.com prevents one failed pane from silencing its neighbors.
 * @param {Function} getTunnelName - Returns the currently selected tunnel name.
 * @returns {Promise<void>} Resolves after every feature mount attempt completes.
 * @sideEffects Installs feature controllers and listeners.
 */
export async function mountLegacyFeatures(getTunnelName) {
	mountFeatureVessels();
	await safeMount("copy", () => mountCopyButtons());
	await safeMount("config", () => mountConfig(getTunnelName));
	await safeMount("rootPicker", () => mountRootPicker(getTunnelName));
	await safeMount("explorer", () => mountExplorer());
	await safeMount("actions", () => mountActions(getTunnelName));
	await safeMount("keys", () => mountKeys());
	await safeMount("terminal", () => mountTerminal());
	await safeMount("prompt", () => mountPrompt());
	await safeMount("usage", () => mountUsage());
	await safeMount("compute", () => mountCompute());
	await safeMount("previewGateway", () => mountPreviewGateway());
	await safeMount("subAgents", () => mountSubAgents(getTunnelName));
	await safeMount("aiAgents", () => mountAiAgents(getTunnelName));
	await safeMount("live", () => mountLive(getTunnelName));
	await safeMount("missionRooms", () => mountMissionRooms(getTunnelName));
	await safeMount("chrome", () => mountChrome(getTunnelName));
}
