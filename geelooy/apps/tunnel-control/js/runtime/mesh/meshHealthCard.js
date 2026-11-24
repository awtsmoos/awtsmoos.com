// B"H

import { h } from "../../ui/core/html.js";
import { compactValue, formatCapabilityLabel, formatModeLabel } from "./meshLabels.js";
import { createJsonReveal } from "./meshJsonToggle.js";
import { runtimeStatus } from "./runtimeStatus.js";

/**
 * B"H
 * Chapter 4: The capability stones stopped screaming their source-code names.
 *
 * A runtime card should say what lives, what sleeps, and what bridge it walks.
 * The Awtsmoos hides the raw machinery until the explorer asks for the scroll.
 *
 * @param {object[]} runtimes Runtime models.
 * @param {object[]} health Health summaries.
 * @returns {HTMLElement} Rendered health card.
 */
export function createRuntimeHealthCard(runtimes, health) {
  const byId = new Map(health.map(item => [item.runtimeId, item]));
  return h("div", {
    classes: ["awt-runtime-health-list"],
    children: runtimes.map(runtime => runtimeHealthRow(runtime, byId.get(runtime.id)))
  });
}

/**
 * B"H
 * Makes one professional runtime summary.
 *
 * @param {object} runtime Runtime model.
 * @param {object} health Health summary.
 * @returns {HTMLElement} Row node.
 */
function runtimeHealthRow(runtime, health = {}) {
  // B"H — Run 08: same honest status treatment as the mesh tiles
  // (runtimeStatus: virtual-os online, native follows its tunnel, else
  // unknown — never invented), and no lone "." subtitle when the
  // runtime's root is the current directory.
  const status = health.connected === true || runtimeStatus(runtime) === "online"
    ? "Connected"
    : runtimeStatus(runtime) === "offline" ? "Offline" : "Unknown";
  const root = runtime.activeRoot && runtime.activeRoot !== "." ? runtime.activeRoot : "";
  return h("article", { classes: ["awt-runtime-health-row"], children: [
    h("div", { classes: ["awt-runtime-health-top"], children: [
      h("strong", { text: health.label || runtime.label || runtime.tunnel?.name || "Runtime" }),
      h("span", { classes: ["awt-status-pill", status.toLowerCase()], text: status })
    ] }),
    ...(root ? [h("p", { classes: ["awt-runtime-subtitle"], text: compactValue(root) })] : []),
    h("div", { classes: ["awt-runtime-facts"], children: [
      fact("Mode", formatModeLabel(health.mode || runtime.mode)),
      fact("Score", `${health.capabilityScore ?? 0}%`)
    ] }),
    capabilityChips(runtime.mountedCapabilities || {}),
    createJsonReveal("runtime health", { health, runtime })
  ] });
}

/**
 * B"H
 * Makes a small fact pair.
 *
 * @param {string} label Label.
 * @param {string} value Value.
 * @returns {HTMLElement} Fact node.
 */
function fact(label, value) {
  return h("span", { classes: ["awt-runtime-fact"], children: [h("b", { text: label }), h("span", { text: value })] });
}

/**
 * B"H
 * Renders clean chips for enabled and disabled capabilities.
 *
 * @param {Record<string, boolean>} capabilities Capability map.
 * @returns {HTMLElement} Chip row.
 */
function capabilityChips(capabilities) {
  return h("div", {
    classes: ["awt-capability-chips"],
    children: Object.entries(capabilities).map(([key, enabled]) => h("span", {
      classes: ["awt-capability-chip", enabled ? "is-enabled" : "is-disabled"],
      text: formatCapabilityLabel(key)
    }))
  });
}
