// --- VENDORED - DO NOT EDIT BY HAND ---
// Source: branch workos-v0.1 @ bbc331f78, path geelooy/apps/workos/core/graph.js
// Extracted read-only via git (git show / git cat-file); re-vendor to update, never hand-edit.
// Shared WorkOS event-fabric core used by the OS shell. See geelooy/os/workos/README.md.
//B"H
// WorkOS core — graph.js. Entity relationship graph from links, causes, and refs.
(function () {
  var W = globalThis.WorkOSCore;

  // related(entityId, {depth=2}) -> {nodes:[entities], edges:[{from,to,rel}]}
  // Sources: work links (both directions), event `causes` chains, work->mission, room->mission.
  function related(entityId, o) {
    o = o || {};
    var depth = o.depth == null ? 2 : o.depth;
    var start = W.entities.get(entityId);
    if (!start) return { nodes: [], edges: [] };

    var nodes = {}, edges = [], seen = {};
    nodes[entityId] = start;
    seen[entityId] = true;

    function addEdge(from, to, rel) {
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        if (e.from === from && e.to === to && e.rel === rel) return;
      }
      edges.push({ from: from, to: to, rel: rel });
      if (!nodes[from]) { var fe = W.entities.get(from); if (fe) nodes[from] = fe; }
      if (!nodes[to]) { var te = W.entities.get(to); if (te) nodes[to] = te; }
    }

    function causeTargets(ev, selfId, out) {
      var causes = ev.causes || [];
      for (var i = 0; i < causes.length; i++) {
        var ce = findEvent(causes[i]);
        if (!ce) continue;
        var refs = [ce.entity, ce.mission, ce.work, ce.room];
        for (var r = 0; r < refs.length; r++) {
          if (refs[r] && refs[r] !== selfId) out.push({ id: refs[r], rel: "caused_by", fwd: true });
        }
      }
    }

    function findEvent(id) {
      var evs = W.state.events;
      for (var i = evs.length - 1; i >= 0; i--) if (evs[i].id === id) return evs[i];
      return null;
    }

    function neighbors(id) {
      var out = [];
      var e = W.entities._live(id);
      if (e) {
        if (e.kind === "work") {
          if (e.attrs.missionId) out.push({ id: e.attrs.missionId, rel: "part_of", fwd: true });
          var links = e.attrs.links || [];
          for (var i = 0; i < links.length; i++) {
            out.push({ id: links[i].other, rel: links[i].rel, fwd: true });
          }
        }
        if (e.kind === "room" && e.attrs.missionId) {
          out.push({ id: e.attrs.missionId, rel: "for_mission", fwd: true });
        }
      }
      // reverse work links: other works that link to this entity
      var works = W.entities.find("work");
      for (var w = 0; w < works.length; w++) {
        var wl = works[w].attrs.links || [];
        for (var j = 0; j < wl.length; j++) {
          if (wl[j].other === id) out.push({ id: works[w].id, rel: wl[j].rel, fwd: false });
        }
      }
      // event causes chains: events touching this entity, following their causes
      var evs = W.state.events;
      for (var k = 0; k < evs.length; k++) {
        var ev = evs[k];
        var refs = [ev.entity, ev.mission, ev.work, ev.room];
        var touches = false;
        for (var r = 0; r < refs.length; r++) if (refs[r] === id) { touches = true; break; }
        if (touches && ev.causes && ev.causes.length) causeTargets(ev, id, out);
      }
      return out;
    }

    var frontier = [entityId];
    for (var d = 0; d < depth; d++) {
      var next = [];
      for (var f = 0; f < frontier.length; f++) {
        var id = frontier[f];
        var ns = neighbors(id);
        for (var n = 0; n < ns.length; n++) {
          var nb = ns[n];
          if (nb.fwd) addEdge(id, nb.id, nb.rel);
          else addEdge(nb.id, id, nb.rel);
          if (!seen[nb.id]) { seen[nb.id] = true; next.push(nb.id); }
        }
      }
      frontier = next;
      if (!frontier.length) break;
    }

    var nodeList = [];
    for (var k in nodes) nodeList.push(nodes[k]);
    return { nodes: nodeList, edges: edges };
  }

  W.graph = { related: related };
})();
