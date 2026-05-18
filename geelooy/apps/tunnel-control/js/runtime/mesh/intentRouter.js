// B"H

import { getActiveRuntime, getRuntime, listRuntimes } from "../runtimeRegistry.js";
import { createRuntimeAdapter } from "./runtimeAdapters.js";
import { recordRuntimeEvent } from "./runtimeTimeline.js";

const INTENT_CAPABILITY = {
  "files.search": "files",
  "files.list": "files",
  "files.read": "files",
  "files.write": "files",
  "terminal.run": "commands",
  "browser.inspect": "browser",
  "semantic.search": "semanticSearch",
  "workflow.run": "workflows"
};

function chooseRuntime(intent, payload = {}) {
  if (payload.runtimeId) return getRuntime(payload.runtimeId);
  if (payload.runtimeMode) return listRuntimes().find(runtime => runtime.mode === payload.runtimeMode) || null;

  const capability = INTENT_CAPABILITY[intent] || "";
  const active = getActiveRuntime();

  if (!capability) return active;
  if (active?.mountedCapabilities?.[capability]) return active;

  return listRuntimes().find(runtime => runtime.mountedCapabilities?.[capability]) || active;
}

/**
 * B"H
 * Routes a high-level intent to the best available runtime.
 *
 * @param {string} intent Intent id.
 * @param {object} payload Intent payload.
 * @returns {Promise<object>} Routed result.
 */
export async function routeIntent(intent, payload = {}) {
  const runtime = chooseRuntime(intent, payload);

  recordRuntimeEvent({
    runtimeId: runtime?.id,
    type: "intent.route",
    summary: `Route ${intent}`,
    payload
  });

  if (!runtime) return { ok: false, error: "No runtime available." };
  return await createRuntimeAdapter(runtime).invoke(intent, payload);
}
