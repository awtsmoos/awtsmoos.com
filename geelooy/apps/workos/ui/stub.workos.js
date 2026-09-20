//B"H
// WorkOS stub — DEV ONLY. A faithful in-memory fake of the WorkOS contract
// for UI development and tests. NEVER loaded by index.html (see app boot check).

(function () {
  var now = Date.now();
  var H = 3600 * 1000, D = 24 * H;

  var mission = {
    id: "m_tunnel",
    kind: "mission",
    name: "Tunnel Hardening — v0.1",
    createdTs: now - 6 * D,
    attrs: {
      objective: "Eliminate the websocket flapping cycle on the Awtsmoos native tunnels: the relay closes the device socket every ~20–60s with code 1000, and reconnect backoff bugs turn each flap into a long outage.",
      acceptance: [
        "Clean server closes classified as socket failures, not unknown",
        "Reconnect backoff resets when the relay accepts registration",
        "Regression tests cover both failure modes",
        "Both live tunnels reconnect in ~1s after a flap"
      ]
    }
  };

  var agents = [
    { id: "a_noam", kind: "agent", name: "Noam Levi", createdTs: now - 6 * D, attrs: { specialty: "tunnel networking" } },
    { id: "a_talia", kind: "agent", name: "Talia Ben-David", createdTs: now - 6 * D, attrs: { specialty: "regression testing" } },
    { id: "a_ari", kind: "agent", name: "Ari Goldstein", createdTs: now - 5 * D, attrs: { specialty: "frontend polish" } }
  ];

  var room = {
    id: "r_tunnel",
    kind: "room",
    name: "tunnel-hardening",
    createdTs: now - 6 * D,
    attrs: { missionId: "m_tunnel" }
  };

  var workItems = [
    { id: "w1", kind: "work", name: "Diagnose 1000-close flaps", createdTs: now - 6 * D,
      attrs: { missionId: "m_tunnel", status: "done", owner: "Noam Levi",
        acceptance: "Root cause documented: relay closes socket every 20–60s with code 1000.",
        links: ["geelooy/apps/tunnel/agent/lib/ws/transportFailure.js"] } },
    { id: "w2", kind: "work", name: "Fix transportFailure classification", createdTs: now - 5 * D,
      attrs: { missionId: "m_tunnel", status: "done", owner: "Noam Levi",
        acceptance: "Underscores normalized to spaces before regex matching; clean closes classified as socket.",
        links: ["geelooy/apps/tunnel/agent/lib/ws/transportFailure.js"] } },
    { id: "w3", kind: "work", name: "Fix reconnect backoff reset", createdTs: now - 5 * D,
      attrs: { missionId: "m_tunnel", status: "review", owner: "Noam Levi",
        acceptance: "markRegistered() resets reconnectAttempt to 0; regression test passes.",
        links: ["geelooy/apps/tunnel/agent/lib/runtime/main-reconnect-policy.js"] } },
    { id: "w4", kind: "work", name: "Add regression tests", createdTs: now - 4 * D,
      attrs: { missionId: "m_tunnel", status: "doing", owner: "Talia Ben-David",
        acceptance: "transportFailureClassification + reconnectPolicyRegistration tests green.",
        links: ["geelooy/apps/tunnel/agent/testing/"] } },
    { id: "w5", kind: "work", name: "Deploy fixes to live tunnels", createdTs: now - 3 * D,
      attrs: { missionId: "m_tunnel", status: "blocked", owner: "Talia Ben-David",
        note: "Waiting on the relay maintenance window — cannot restart the live child process yet.",
        acceptance: "Both tunnels reconnect within ~2s of a flap for 30 minutes straight.",
        links: [] } },
    { id: "w6", kind: "work", name: "Polish tunnel status UI", createdTs: now - 2 * D,
      attrs: { missionId: "m_tunnel", status: "todo", owner: "Ari Goldstein",
        acceptance: "Status page shows generation, missed heartbeats and last flap time.",
        links: [] } }
  ];

  // Oldest first. One of every semantic message kind.
  var messages = [
    { id: "m1", type: "room.message", entity: "r_tunnel", actor: "Noam Levi", ts: now - 5 * D,
      data: { msgKind: "announcement", body: "Kickoff: the flap cycle is our top priority. Everything else waits." } },
    { id: "m2", type: "room.message", entity: "r_tunnel", actor: "Talia Ben-David", ts: now - 5 * D + H,
      data: { msgKind: "discovery", body: "Found it: classification regexes use spaces (\"remote close\") but real messages use underscores (\"remote_close_1000\"). Clean closes were categorized unknown." } },
    { id: "m3", type: "room.message", entity: "r_tunnel", actor: "Noam Levi", ts: now - 4 * D,
      data: { msgKind: "message", body: "Confirming the discovery — the ws close frame reason is empty and code is 1000. Upstream likely." } },
    { id: "m4", type: "room.message", entity: "r_tunnel", actor: "Noam Levi", ts: now - 4 * D + H,
      data: { msgKind: "delegation", body: "Talia: please write the regression tests for both classification and the backoff reset.", to: "Talia Ben-David" } },
    { id: "m5", type: "room.message", entity: "r_tunnel", actor: "Talia Ben-David", ts: now - 3 * D,
      data: { msgKind: "obligation", body: "I will have both regression test files green by end of day, before any deploy." } },
    { id: "m6", type: "room.message", entity: "r_tunnel", actor: "Talia Ben-David", ts: now - 3 * D + H,
      data: { msgKind: "request", body: "Can someone review the backoff patch? I want a second pair of eyes on markRegistered()." } },
    { id: "m7", type: "room.message", entity: "r_tunnel", actor: "Noam Levi", ts: now - 2 * D,
      data: { msgKind: "response", body: "Reviewed — the reset is in the right place. Registration accepted means the relay heard us; backoff should restart from zero." } },
    { id: "m8", type: "room.message", entity: "r_tunnel", actor: "Ari Goldstein", ts: now - 2 * D + H,
      data: { msgKind: "blocker", body: "Deploy is blocked: the relay maintenance window hasn't opened, so the live child process can't be restarted yet." } },
    { id: "m9", type: "room.message", entity: "r_tunnel", actor: "Noam Levi", ts: now - 1 * D,
      data: { msgKind: "review_request", body: "Requesting review of the full diff before deploy: transportFailure.js + main-reconnect-policy.js + tests.", to: "Talia Ben-David" } },
    { id: "m10", type: "room.message", entity: "r_tunnel", actor: "Talia Ben-David", ts: now - 12 * H,
      data: { msgKind: "handoff", body: "Handing the deploy checklist to the on-call agent: copy both files to live roots, restart child processes, watch generation for 5 minutes.", to: "on-call" } }
  ];

  var decisions = [
    { id: "d1", type: "decision.accepted", entity: "m_tunnel", actor: "Noam Levi", ts: now - 4 * D,
      data: { title: "Reset reconnect backoff on accepted registration",
        rationale: "A relay-accepted registration proves the path is healthy; keeping accumulated backoff after a successful registration is wrong." } },
    { id: "d2", type: "decision.superseded", entity: "m_tunnel", actor: "Noam Levi", ts: now - 5 * D,
      data: { title: "Raise max backoff to 60s as the fix",
        rationale: "First instinct was to tolerate longer flaps by raising the ceiling. Rejected once the real bug (backoff never resetting) was found." } },
    { id: "d3", type: "decision.accepted", entity: "m_tunnel", actor: "Noam Levi", ts: now - 4 * D + H,
      data: { title: "Classify clean server closes as socket failures",
        rationale: "Code 1000 with an empty reason is the relay/proxy closing idle sockets — an upstream transport event, so it gets the fast 5s-max backoff lane.",
        supersedes: "d2 — Raise max backoff to 60s as the fix" } },
    { id: "d4", type: "decision.proposed", entity: "m_tunnel", actor: "Talia Ben-David", ts: now - 2 * D,
      data: { title: "Add relay-side keepalive tuning",
        rationale: "If the relay closes idle sockets, a client keepalive under the idle timeout could prevent the flap entirely. Needs relay docs check." } },
    { id: "d5", type: "decision.rejected", entity: "m_tunnel", actor: "Noam Levi", ts: now - 3 * D,
      data: { title: "Restart tunnels hourly as mitigation",
        rationale: "Masks the bug instead of fixing it, and each restart risks dropping in-flight work." } }
  ];

  var files = [
    { id: "f1", kind: "file", name: "transportFailure.js", createdTs: now - 6 * D,
      attrs: { missionId: "m_tunnel", path: "agent/lib/ws/transportFailure.js" } },
    { id: "f2", kind: "file", name: "main-reconnect-policy.js", createdTs: now - 6 * D,
      attrs: { missionId: "m_tunnel", path: "agent/lib/runtime/main-reconnect-policy.js" } }
  ];

  var facts = [
    { id: "fc1", mission: "m_tunnel", ts: now - 5 * D, text: "Relay closes the device websocket every ~20–60s with code 1000 and an empty reason.", source: "tunnel telemetry" },
    { id: "fc2", mission: "m_tunnel", ts: now - 4 * D, text: "Classification regexes used spaces but real close messages use underscores.", source: "Talia Ben-David" },
    { id: "fc3", mission: "m_tunnel", ts: now - 4 * D, text: "markRegistered() did not reset reconnectAttempt, so backoff accumulated across successful registrations.", source: "Noam Levi" }
  ];

  var claims = [
    { id: "cl1", mission: "m_tunnel", ts: now - 3 * D, text: "Fast reconnects (~1s) will eliminate the request stall users see during flaps.", status: "unverified", source: "Noam Levi" },
    { id: "cl2", mission: "m_tunnel", ts: now - 2 * D, text: "Both regression tests pass on the Mac runner.", status: "verified", source: "Talia Ben-David" }
  ];

  // Newest-first activity feed.
  var events = [
    { id: "e1", type: "work.status", entity: "w5", actor: "Talia Ben-David", ts: now - 20 * H, mission: "m_tunnel", data: { summary: "Deploy fixes to live tunnels → blocked (waiting on relay maintenance window)" } },
    { id: "e2", type: "room.message", entity: "r_tunnel", actor: "Talia Ben-David", ts: now - 12 * H, mission: "m_tunnel", data: { summary: "handoff: deploy checklist handed to on-call" } },
    { id: "e3", type: "decision.proposed", entity: "m_tunnel", actor: "Talia Ben-David", ts: now - 2 * D, mission: "m_tunnel", data: { summary: "Proposed: Add relay-side keepalive tuning" } },
    { id: "e4", type: "work.status", entity: "w4", actor: "Talia Ben-David", ts: now - 4 * D + 2 * H, mission: "m_tunnel", data: { summary: "Add regression tests → doing" } },
    { id: "e5", type: "file.modified", entity: "f2", actor: "Noam Levi", ts: now - 4 * D + H, mission: "m_tunnel", data: { summary: "main-reconnect-policy.js: markRegistered() now resets reconnectAttempt" } },
    { id: "e6", type: "provenance.recorded", entity: "f1", actor: "Noam Levi", ts: now - 4 * D, mission: "m_tunnel", data: { summary: "Provenance recorded for transportFailure.js fix (diff + rationale)" } },
    { id: "e7", type: "file.modified", entity: "f1", actor: "Noam Levi", ts: now - 4 * D, mission: "m_tunnel", data: { summary: "transportFailure.js: normalize underscores before classification" } },
    { id: "e8", type: "file.created", entity: "f2", actor: "Noam Levi", ts: now - 5 * D, mission: "m_tunnel", data: { summary: "main-reconnect-policy.js linked to mission" } },
    { id: "e9", type: "file.created", entity: "f1", actor: "Noam Levi", ts: now - 5 * D, mission: "m_tunnel", data: { summary: "transportFailure.js linked to mission" } },
    { id: "e10", type: "mission.created", entity: "m_tunnel", actor: "you", ts: now - 6 * D, mission: "m_tunnel", data: { summary: "Mission created: Tunnel Hardening — v0.1" } }
  ];

  var presence = [
    { agentId: "a_noam", name: "Noam Levi", status: "online", ts: now - 5 * 60000 },
    { agentId: "a_talia", name: "Talia Ben-David", status: "online", ts: now - 12 * 60000 },
    { agentId: "a_ari", name: "Ari Goldstein", status: "idle", ts: now - 3 * H }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var seeded = true;

  var WorkOS = {
    version: "0.1.0-stub",
    seed: function () { seeded = true; return true; },

    missions: {
      list: function () { return [clone(mission)]; },
      overview: function (id) {
        var done = workItems.filter(function (w) { return w.attrs.status === "done"; }).length;
        var total = workItems.length;
        return {
          mission: clone(mission),
          progress: { total: total, done: done, pct: Math.round((done / total) * 100) },
          blockers: workItems.filter(function (w) { return w.attrs.status === "blocked"; })
            .map(function (w) { return { id: w.id, name: w.name, note: w.attrs.note || "" }; }),
          agents: [
            { agent: clone(agents[0]), status: "online", currentWork: "Fix transportFailure classification" },
            { agent: clone(agents[1]), status: "online", currentWork: "Add regression tests" },
            { agent: clone(agents[2]), status: "idle", currentWork: "" }
          ],
          recentActivity: clone(events.slice(0, 5)),
          decisions: clone(decisions),
          openRequests: [
            { id: "m6", title: "Review the backoff patch", body: "Can someone review the backoff patch?", actor: "Talia Ben-David" }
          ]
        };
      }
    },

    work: {
      list: function (filter) {
        filter = filter || {};
        return workItems.filter(function (w) {
          if (filter.missionId && w.attrs.missionId !== filter.missionId) return false;
          if (filter.status && w.attrs.status !== filter.status) return false;
          return true;
        }).map(clone);
      },
      setStatus: function (id, status, opts) {
        for (var i = 0; i < workItems.length; i++) {
          if (workItems[i].id === id) {
            workItems[i].attrs.status = status;
            if (opts && opts.note) workItems[i].attrs.note = opts.note;
            events.unshift({ id: "e" + Date.now(), type: "work.status", entity: id,
              actor: "you", ts: Date.now(), mission: workItems[i].attrs.missionId,
              data: { summary: workItems[i].name + " → " + status } });
            return clone(workItems[i]);
          }
        }
        return null;
      }
    },

    rooms: {
      history: function (roomId, opts) {
        var list = messages.filter(function (m) { return m.entity === roomId; }).map(clone);
        if (opts && opts.limit) list = list.slice(-opts.limit);
        return list;
      },
      post: function (roomId, msg) {
        var ev = { id: "m" + Date.now(), type: "room.message", entity: roomId,
          actor: msg.author || "you", ts: Date.now(),
          data: { msgKind: msg.msgKind || "message", body: msg.body || "" } };
        messages.push(clone(ev));
        events.unshift({ id: "e" + Date.now(), type: "room.message", entity: roomId,
          actor: ev.actor, ts: ev.ts, mission: "m_tunnel",
          data: { summary: (msg.msgKind || "message") + ": " + String(msg.body || "").slice(0, 80) } });
        return clone(ev);
      },
      presence: function () { return clone(presence); }
    },

    entities: {
      find: function (kind, q) {
        var all = [];
        if (!kind || kind === "mission") all = all.concat([mission]);
        if (!kind || kind === "agent") all = all.concat(agents);
        if (!kind || kind === "room") all = all.concat([room]);
        if (!kind || kind === "file") all = all.concat(files);
        if (!kind || kind === "work") all = all.concat(workItems);
        if (q) {
          var needle = String(q).toLowerCase();
          all = all.filter(function (e) {
            return String(e.name || e.id || "").toLowerCase().indexOf(needle) >= 0;
          });
        }
        return all.map(clone);
      },
      get: function (id) {
        var found = null;
        this.find().forEach(function (e) { if (e.id === id) found = e; });
        return found ? clone(found) : null;
      }
    },

    decisions: {
      list: function (filter) {
        filter = filter || {};
        return decisions.filter(function (d) {
          return !filter.mission || d.entity === filter.mission;
        }).map(clone);
      }
    },

    facts: {
      list: function (filter) {
        filter = filter || {};
        var list = facts.filter(function (f) { return !filter.mission || f.mission === filter.mission; });
        if (filter.limit) list = list.slice(0, filter.limit);
        return clone(list);
      }
    },

    claims: {
      list: function (filter) {
        filter = filter || {};
        var list = claims.filter(function (c) { return !filter.mission || c.mission === filter.mission; });
        if (filter.limit) list = list.slice(0, filter.limit);
        return clone(list);
      }
    },

    events: {
      list: function (filter) {
        filter = filter || {};
        var list = events.filter(function (e) { return !filter.mission || e.mission === filter.mission; });
        if (filter.limit) list = list.slice(0, filter.limit);
        return clone(list);
      }
    }
  };

  if (typeof globalThis !== "undefined") globalThis.WorkOS = WorkOS;
  else if (typeof window !== "undefined") window.WorkOS = WorkOS;
})();
