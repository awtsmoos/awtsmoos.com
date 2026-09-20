//B"H
// WorkOS core — seed.js. Idempotent demo world: "Tunnel Hardening — v0.1".
(function () {
  var W = globalThis.WorkOSCore;

  function seed() {
    // Idempotent: if any mission entity exists, do nothing.
    if (W.entities.find("mission").length) return { seeded: false };

    var sys = { kind: "system", id: "system" };

    // ---- mission ----
    var mission = W.missions.create({
      title: "Tunnel Hardening — v0.1",
      objective: "Make tunnel reconnects instant and observable",
      acceptance: "p99 action latency under 3s during flaps",
      actor: sys
    });
    var mid = mission.id;

    // ---- agents + human ----
    var sela = W.entities.register("agent", { name: "Sela", attrs: { role: "builder" } });
    var poretz = W.entities.register("agent", { name: "Poretz", attrs: { role: "breaker" } });
    var mevakir = W.entities.register("agent", { name: "Mevakir", attrs: { role: "reviewer" } });
    var yaakov = W.entities.register("human", { name: "Yaakov", attrs: { role: "owner" } });

    // ---- work items: 2 done, 2 doing, 1 todo, 1 blocked ----
    function mkWork(title, ownerId, acceptance) {
      return W.work.create({ missionId: mid, title: title, owner: ownerId, acceptance: acceptance || "", actor: sys });
    }
    var w1 = mkWork("Fix transportFailure close-message classification", sela.id,
      "underscore-style close messages classify as socket failures, not unknown");
    var w2 = mkWork("Reset reconnect backoff on registration", sela.id,
      "markRegistered() resets reconnectAttempt to 0");
    var w3 = mkWork("Add regression tests for reconnect policy", poretz.id,
      "classification + registration-reset tests pass");
    var w4 = mkWork("Measure p99 action latency during flaps", poretz.id,
      "p99 action latency under 3s during induced flaps");
    var w5 = mkWork("Write tunnel-doctor diagnostics", mevakir.id,
      "tunnelDoctor reports flap cause and backoff state");
    var w6 = mkWork("Deploy fix to live tunnels", sela.id,
      "both tunnels reconnect in ~1s after server-side close");

    W.work.setStatus(w1.id, "done", { note: "Regexes fixed and live", actor: sela.id });
    W.work.setStatus(w2.id, "done", { note: "Backoff reset deployed", actor: sela.id });
    W.work.setStatus(w3.id, "doing", { note: "Writing classification tests", actor: poretz.id });
    W.work.setStatus(w4.id, "doing", { note: "Setting up flap harness", actor: poretz.id });
    W.work.setStatus(w6.id, "blocked", { note: "Waiting on latency numbers before deploy", actor: sela.id });
    // w5 stays todo
    // w6 is blocked BY w4 (a doing item): w4 blocks w6
    W.work.link(w4.id, w6.id, "blocks");

    // ---- room ----
    var room = W.rooms.create({ missionId: mid, name: "tunnel-hardening-room", actor: sys });
    var rid = room.id;

    var posts = [
      { author: sela.id, msgKind: "announcement", body: "Tunnel hardening sprint is live. Objective: instant, observable reconnects." },
      { author: poretz.id, msgKind: "message", body: "Reproduced the flap: the relay closes the device socket every ~30s with code 1000." },
      { author: poretz.id, msgKind: "discovery", body: "Root cause: transportFailure.js classifies 'remote_close_1000' as unknown — the regexes expect spaces but real messages use underscores." },
      { author: mevakir.id, msgKind: "request", body: "Please add regression tests covering underscore-style close messages before we merge." },
      { author: sela.id, msgKind: "response", body: "Tests added: transportFailureClassification.test.cjs and reconnectPolicyRegistration.test.cjs — both green." },
      { author: yaakov.id, msgKind: "delegation", body: "Sela: deploy the fix to both live tunnels tonight. Poretz: measure p99 latency during flaps." },
      { author: mevakir.id, msgKind: "obligation", body: "Do not merge until the backoff-reset regression test passes on the rescue tunnel.", to: sela.id },
      { author: poretz.id, msgKind: "blocker", body: "Blocked: latency measurement needs a live flap, and the relay is currently stable." },
      { author: sela.id, msgKind: "review_request", body: "Review requested: main-reconnect-policy.js markRegistered() backoff reset.", to: mevakir.id },
      { author: mevakir.id, msgKind: "message", body: "Reviewed — the reset matches the documented intent. Approved." },
      { author: sela.id, msgKind: "handoff", body: "Handoff: fix is live on both tunnels; over to Poretz for the p99 measurement.", to: poretz.id },
      { author: poretz.id, msgKind: "discovery", body: "Discovery: with fast reconnects, action latency dropped from ~31s to ~1.9s." },
      { author: yaakov.id, msgKind: "announcement", body: "Decision locked: reconnect backoff resets on registration. Per-channel isolation replaces the shared-socket idea." }
    ];
    for (var i = 0; i < posts.length; i++) W.rooms.post(rid, posts[i]);

    // ---- presence for the 3 agents ----
    W.rooms.setPresence(rid, sela.id, "online");
    W.rooms.setPresence(rid, poretz.id, "online");
    W.rooms.setPresence(rid, mevakir.id, "away");

    // ---- decisions ----
    function dec(type, title, rationale, supersedes) {
      var d = { title: title, rationale: rationale || "" };
      if (supersedes) d.supersedes = supersedes;
      W.events.append({ type: type, actor: sys, mission: mid, data: d });
    }
    dec("decision.proposed", "Reconnect backoff resets on registration",
      "A relay-accepted registration proves the path is healthy; keeping old backoff punishes recovery.");
    dec("decision.accepted", "Reconnect backoff resets on registration",
      "Matches the documented intent of the reconnect policy; verified by regression test.");
    dec("decision.proposed", "Per-channel isolation",
      "One socket per channel bounds blast radius when a single channel misbehaves.");
    dec("decision.accepted", "Per-channel isolation",
      "Cheaper to reason about than shared multiplexing; accepted after review.");
    dec("decision.proposed", "Single shared socket for all agents",
      "Fewer connections looked simpler on paper.");
    dec("decision.superseded", "Single shared socket for all agents",
      "A single poisoned channel could stall every agent.", "Per-channel isolation");

    // ---- facts: 2x test_passed, 1x command_exited ----
    W.events.append({ type: "fact.test_passed", actor: sela.id, mission: mid,
      data: { suite: "transportFailureClassification.test.cjs", passed: 12, failed: 0 } });
    W.events.append({ type: "fact.test_passed", actor: sela.id, mission: mid,
      data: { suite: "reconnectPolicyRegistration.test.cjs", passed: 8, failed: 0 } });
    W.events.append({ type: "fact.command_exited", actor: poretz.id, mission: mid,
      data: { command: "node --test agent/testing/", exitCode: 0 } });

    // ---- claims: 1x claim.made ----
    W.events.append({ type: "claim.made", actor: poretz.id, mission: mid,
      data: { text: "Server-side 1000-closes are relay/proxy behavior, external to the tunnel client.", confidence: 0.8 } });

    // ---- file entities + provenance (2 records, each file gets attrs.history entries) ----
    var f1 = W.entities.register("file", {
      name: "agent/lib/ws/transportFailure.js",
      attrs: { path: "agent/lib/ws/transportFailure.js", history: [] }
    });
    var f2 = W.entities.register("file", {
      name: "agent/lib/runtime/main-reconnect-policy.js",
      attrs: { path: "agent/lib/runtime/main-reconnect-policy.js", history: [] }
    });
    W.provenance.record({
      tool: "tunnel-fs.write", agentId: sela.id, entityId: f1.id,
      summary: "Normalized underscores to spaces before classifying close messages",
      intent: "Fix misclassification of remote_close_1000 as unknown",
      beforeHash: "sha256:9f2c-old", afterHash: "sha256:9f2c-new", outcome: "ok"
    });
    W.provenance.record({
      tool: "tunnel-fs.write", agentId: sela.id, entityId: f2.id,
      summary: "markRegistered() now resets reconnectAttempt to 0",
      intent: "Stop backoff accumulation across successful registrations",
      beforeHash: "sha256:41ab-old", afterHash: "sha256:41ab-new", outcome: "ok"
    });

    return { seeded: true, missionId: mid, roomId: rid };
  }

  W.seed = seed;
})();
