
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
import { safeMount } from "./safeMount.js";

/**
 * B"H
 * Chapter 3 continued: Retiring the Rival Thrones.
 *
 * The old shell builders are no longer mounted here. This function now creates
 * feature vessels, then binds behavior to those controls. The visible palace is
 * owned by shell/mountShell.js alone.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<void>} Resolves after feature behavior is attached.
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
  await safeMount("chrome", () => mountChrome(getTunnelName));
}
