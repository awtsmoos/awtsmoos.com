//B"H
// WorkOS core — capsule.js. Budgeted context compiler for agents joining work.
(function () {
  var W = globalThis.WorkOSCore;

  var LAWS = [
    "WorkOS operating laws (mandatory context for every agent):",
    "1. Source of truth: Hebrew source text is verbatim and never rewritten; English is translation, never replacement.",
    "2. Facts, claims, and decisions are separate: record observations as facts, hypotheses as claims with confidence, choices as decisions with rationale.",
    "3. Every mutation leaves provenance: who did it, with what tool, why, and the before/after state.",
    "4. Identity is stable: entities keep their IDs across renames; history is append-only, never rewritten.",
    "5. No invented content: never fabricate quotes, footnotes, or evidence. Flag gaps as NEEDS_REVIEW.",
    "6. Work is explicit: status changes carry notes and evidence; blockers name what would unblock them."
  ].join("\n");

  // compile({missionId?, workId?, agentId?, budgetTokens=4000}) -> {layers, totalTokens, text}
  // Layer priority (high -> low): laws, objective, canonical_decisions, active_work,
  // blockers, peer_obligations, recent_discoveries, known_failures.
  function compile(o) {
    o = o || {};
    var budget = o.budgetTokens || 4000;
    var missionId = o.missionId || null;
    var workId = o.workId || null;
    var agentId = o.agentId || null;

    var workEnt = workId ? W.work.get(workId) : null;
    if (workEnt && !missionId) missionId = workEnt.attrs.missionId;
    var mission = missionId ? W.missions.get(missionId) : null;

    var rooms = W.entities.find("room");
    var missionRooms = missionId
      ? rooms.filter(function (r) { return r.attrs.missionId === missionId; })
      : rooms;

    function roomMessages(msgKind, limit) {
      var out = [];
      for (var i = 0; i < missionRooms.length && out.length < limit; i++) {
        var h = W.events.list({ room: missionRooms[i].id, type: "room.message", limit: limit });
        for (var j = 0; j < h.length && out.length < limit; j++) {
          if (!msgKind || (h[j].data && h[j].data.msgKind === msgKind)) out.push(h[j]);
        }
      }
      return out;
    }

    function fmtWork(w) {
      var owner = w.attrs.owner ? W.entities.get(w.attrs.owner) : null;
      return "- " + w.name + " [" + w.attrs.status + "]" +
        (owner ? " (owner: " + owner.name + ")" : " (unassigned)");
    }

    var layers = [];
    function add(name, text, mandatory) {
      text = text || "";
      layers.push({ name: name, text: text, tokens: W.util.estTokens(text), mandatory: !!mandatory });
    }

    // 1. laws (mandatory — never dropped)
    add("laws", LAWS, true);

    // 2. objective
    var objText = "";
    if (mission) {
      objText = "Mission: " + mission.name +
        "\nObjective: " + (mission.attrs.objective || "(none stated)") +
        "\nAcceptance: " + (mission.attrs.acceptance || "(none stated)") +
        "\nStatus: " + (mission.attrs.status || "active");
    } else if (workEnt) {
      objText = "Work: " + workEnt.name +
        "\nStatus: " + workEnt.attrs.status +
        "\nAcceptance: " + (workEnt.attrs.acceptance || "(none stated)");
    } else {
      objText = "No mission or work scope selected. This capsule covers the whole workspace.";
    }
    if (agentId) {
      var ag = W.entities.get(agentId);
      if (ag) objText += "\nCompiling for agent: " + ag.name;
    }
    add("objective", objText, false);

    // 3. canonical_decisions (accepted / implemented)
    var decs = W.decisions.list(missionId ? { mission: missionId } : {});
    var canon = decs.filter(function (d) { return d.status === "accepted" || d.status === "implemented"; });
    add("canonical_decisions",
      canon.length
        ? canon.map(function (d) { return "- " + d.title + " (" + d.status + ")" + (d.rationale ? ": " + d.rationale : ""); }).join("\n")
        : "(no accepted decisions recorded)",
      false);

    // 4. active_work (doing + review)
    var active = W.work.list(missionId ? { missionId: missionId } : {})
      .filter(function (w) { return w.attrs.status === "doing" || w.attrs.status === "review"; });
    add("active_work",
      active.length ? active.map(fmtWork).join("\n") : "(no active work items)",
      false);

    // 5. blockers
    var blocked = W.work.list(missionId ? { missionId: missionId } : {})
      .filter(function (w) { return w.attrs.status === "blocked"; });
    var blockerMsgs = roomMessages("blocker", 5);
    var bText = blocked.length ? blocked.map(fmtWork).join("\n") : "(no blocked work items)";
    if (blockerMsgs.length) {
      bText += "\nReported blockers:\n" + blockerMsgs.map(function (e) {
        return "- " + (e.actor.name || e.actor.id) + ": " + e.data.body;
      }).join("\n");
    }
    add("blockers", bText, false);

    // 6. peer_obligations
    var obls = roomMessages("obligation", 8).filter(function (e) {
      return !agentId || !e.data.to || e.data.to === agentId;
    });
    add("peer_obligations",
      obls.length
        ? obls.map(function (e) {
            return "- " + (e.actor.name || e.actor.id) + (e.data.to ? " -> " + e.data.to : "") + ": " + e.data.body;
          }).join("\n")
        : "(no open obligations)",
      false);

    // 7. recent_discoveries (facts + discovery messages)
    var facts = W.facts.list({ mission: missionId, limit: 6 });
    var discs = roomMessages("discovery", 4);
    var dParts = [];
    facts.forEach(function (f) { dParts.push("- [fact] " + f.type + ": " + JSON.stringify(f.data)); });
    discs.forEach(function (e) { dParts.push("- [discovery] " + (e.actor.name || e.actor.id) + ": " + e.data.body); });
    add("recent_discoveries", dParts.length ? dParts.join("\n") : "(no recent discoveries)", false);

    // 8. known_failures
    var fails = W.facts.list({ mission: missionId }).filter(function (f) { return f.type === "fact.test_failed"; });
    add("known_failures",
      fails.length
        ? fails.slice(0, 6).map(function (f) { return "- " + JSON.stringify(f.data); }).join("\n")
        : "(no recorded failures)",
      false);

    // ---- budget fit: drop lowest-priority non-mandatory layers first ----
    function total() {
      var s = 0;
      for (var i = 0; i < layers.length; i++) s += layers[i].tokens;
      return s;
    }
    var notes = [];
    var dropped = 0;
    for (var i = layers.length - 1; i >= 0 && total() > budget; i--) {
      if (!layers[i].mandatory) { layers.splice(i, 1); dropped++; }
    }
    // Still over: truncate lowest-priority remaining non-mandatory layer.
    if (total() > budget) {
      for (var j = layers.length - 1; j >= 0; j--) {
        if (!layers[j].mandatory) {
          var room2 = budget - (total() - layers[j].tokens);
          var chars = Math.max(0, room2 * 4 - 40);
          layers[j].text = layers[j].text.slice(0, chars) + "\n…[truncated to fit budget]";
          layers[j].tokens = W.util.estTokens(layers[j].text);
          notes.push("Layer '" + layers[j].name + "' was truncated to fit the token budget.");
          break;
        }
      }
    }
    if (dropped) notes.push("Dropped " + dropped + " lower-priority layer(s) to fit the token budget.");
    var mandatoryOver = layers.some(function (l) { return l.mandatory; }) && total() > budget;
    if (mandatoryOver) {
      notes.push("Note: mandatory layer(s) exceed the token budget (" + total() + " > " + budget + "); kept anyway.");
    }

    var text = layers.map(function (l) { return "## " + l.name + "\n" + l.text; }).join("\n\n");
    if (notes.length) text += "\n\n_" + notes.join(" ") + "_";

    return { layers: layers, totalTokens: total(), text: text };
  }

  W.capsule = { compile: compile };
})();
