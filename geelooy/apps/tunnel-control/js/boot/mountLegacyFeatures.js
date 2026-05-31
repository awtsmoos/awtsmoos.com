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
import { mountAiAgents } from "../features/aiAgents.js";
import { safeMount } from "./safeMount.js";

/**
 * B"H
 * Chapter 338: The New Chamber Received Its Nerves.
 *
 * The hidden vessels are mounted first; then each control receives its breath.
 * The AI-agent council is wired after usage so provider keys, list calls, and
 * delegate messages can flow through the same tunnel name reader.
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
  await safeMount("aiAgents", () => mountAiAgents(getTunnelName));
  await safeMount("chrome", () => mountChrome(getTunnelName));
}
