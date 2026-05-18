// B"H

import { recordRuntimeEvent } from "./runtimeTimeline.js";
import { listVirtualFiles, readVirtualFile, writeVirtualFile } from "./virtualFilesystem.js";

function virtualInvoke(action, payload = {}) {
  if (action === "files.search" || action === "files.list") return { ok: true, entries: listVirtualFiles(payload.path || "/") };
  if (action === "files.read") return readVirtualFile(payload.path || "/README.awt");
  if (action === "files.write") return writeVirtualFile(payload.path || "/draft.txt", payload.content || "");
  if (action === "semantic.search") return { ok: true, matches: listVirtualFiles("/").filter(entry => entry.path.toLowerCase().includes(String(payload.q || "").toLowerCase())) };
  if (action === "workflow.run") return { ok: true, workflow: payload.workflow || "virtual", simulated: true };
  return { ok: true, simulated: true, action, payload };
}

/**
 * B"H
 * Creates a normalized adapter around a runtime.
 *
 * @param {object} runtime Runtime descriptor.
 * @returns {object} Adapter.
 */
export function createRuntimeAdapter(runtime) {
  const caps = runtime?.mountedCapabilities || {};

  return {
    id: runtime?.id || "unknown",
    runtime,
    can(capability) {
      return !!caps[capability];
    },
    describe() {
      return {
        id: runtime?.id,
        mode: runtime?.mode,
        root: runtime?.activeRoot,
        capabilities: caps
      };
    },
    async invoke(action, payload = {}) {
      const event = recordRuntimeEvent({
        runtimeId: runtime?.id,
        type: "intent.invoke",
        summary: `Invoke ${action}`,
        payload: { action, payload }
      });

      if (runtime?.mode === "virtual-os") {
        return {
          ...virtualInvoke(action, payload),
          virtual: true,
          action,
          eventId: event.id
        };
      }

      return {
        ok: false,
        action,
        eventId: event.id,
        message: "Adapter recorded intent. Real local execution remains delegated to the existing tunnel feature modules."
      };
    }
  };
}
