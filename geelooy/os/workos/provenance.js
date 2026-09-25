// --- VENDORED - DO NOT EDIT BY HAND ---
// Source: branch workos-v0.1 @ bbc331f78, path geelooy/apps/workos/core/provenance.js
// Extracted read-only via git (git show / git cat-file); re-vendor to update, never hand-edit.
// Shared WorkOS event-fabric core used by the OS shell. See geelooy/os/workos/README.md.
//B"H
// WorkOS core — provenance.js. Who did what, with what tool, why, before/after.
(function () {
  var W = globalThis.WorkOSCore;

  // record({tool, agentId, entityId?, summary, intent?, beforeHash?, afterHash?, outcome?, data?})
  // -> provenance.recorded event; also appends to entity.attrs.history[] when entityId resolves.
  function record(o) {
    o = o || {};
    if (!o.tool) throw new Error("provenance.record: tool is required");
    var actor = o.agentId ? { kind: "agent", id: o.agentId } : { kind: "system", id: "system" };
    var agentEnt = o.agentId ? W.entities.get(o.agentId) : null;
    if (agentEnt) actor = { kind: agentEnt.kind, id: agentEnt.id, name: agentEnt.name };

    var ent = o.entityId ? W.entities._live(o.entityId) : null;
    if (ent) {
      ent.attrs.history = ent.attrs.history || [];
      ent.attrs.history.push({
        ts: W.util.now(),
        tool: o.tool,
        summary: o.summary || "",
        outcome: o.outcome != null ? o.outcome : null,
        beforeHash: o.beforeHash != null ? o.beforeHash : null,
        afterHash: o.afterHash != null ? o.afterHash : null
      });
    }

    var ev = W.events.append({
      type: "provenance.recorded",
      actor: actor,
      entity: o.entityId || null,
      data: {
        tool: o.tool,
        agentId: o.agentId || null,
        summary: o.summary || "",
        intent: o.intent != null ? o.intent : null,
        beforeHash: o.beforeHash != null ? o.beforeHash : null,
        afterHash: o.afterHash != null ? o.afterHash : null,
        outcome: o.outcome != null ? o.outcome : null,
        extra: o.data ? W.util.clone(o.data) : {}
      }
    });
    // events.append already persisted; the history mutation above rides along.
    return ev;
  }

  W.provenance = { record: record };
})();
