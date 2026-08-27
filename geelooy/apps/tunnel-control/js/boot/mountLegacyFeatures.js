// B"H
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
import { mountLive } from "../features/live.js";
import { mountMissionRooms } from "../features/missionRooms.js";
import { safeMount } from "./safeMount.js";

/**
 * B"H
 * Chapter 421: Preview Gateway listeners were fastened into the shell.
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
  await safeMount("aiAgents", () => mountAiAgents(getTunnelName));
  await safeMount("live", () => mountLive(getTunnelName));
  await safeMount("missionRooms", () => mountMissionRooms(getTunnelName));
  await safeMount("chrome", () => mountChrome(getTunnelName));
}
