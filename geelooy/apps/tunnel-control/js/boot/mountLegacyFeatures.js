
// B"H

import { mountTabs } from "../ui/tabs.js";
import { mountCopyButtons } from "../ui/copy.js";
import { mountControlPanels } from "../ui/controlPanels.js";
import { mountExplorer } from "../features/explorer.js";
import { mountActions } from "../features/actions.js";
import { mountApiKeys } from "../features/apiKeys.js";
import { mountUsage } from "../features/usage.js";
import { mountConfig } from "../features/config.js";
import { mountRootPicker } from "../features/rootPicker.js";
import { mountChrome } from "../features/chrome.js";
import { safeMount } from "./safeMount.js";

/**
 * B"H
 * Mounts the existing working feature modules.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<void>} Resolves after all feature mounts.
 */
export async function mountLegacyFeatures(getTunnelName) {
  await safeMount("tabs", () => mountTabs());
  await safeMount("controlPanels", () => mountControlPanels());
  await safeMount("copy", () => mountCopyButtons());
  await safeMount("config", () => mountConfig(getTunnelName));
  await safeMount("rootPicker", () => mountRootPicker(getTunnelName));
  await safeMount("explorer", () => mountExplorer());
  await safeMount("actions", () => mountActions(getTunnelName));
  await safeMount("apiKeys", () => mountApiKeys());
  await safeMount("usage", () => mountUsage());
  await safeMount("chrome", () => mountChrome(getTunnelName));
}
