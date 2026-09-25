//B"H
// WorkOS core — entities.js. Stable-identity entity registry (id never changes).
(function () {
  var W = globalThis.WorkOSCore;

  function persist() { if (W.persist) W.persist(); }
  function live(id) { return W.state.entities[id] || null; }

  // register(kind, {name, attrs?, pathAliases?}) -> entity
  function register(kind, o) {
    o = o || {};
    if (!kind) throw new Error("entities.register: kind is required");
    if (!o.name) throw new Error("entities.register: name is required");
    var e = {
      id: "awts://entity/" + kind + "/" + W.util.uid(),
      kind: kind,
      name: o.name,
      createdTs: W.util.now(),
      attrs: o.attrs ? W.util.clone(o.attrs) : {},
      pathAliases: o.pathAliases ? o.pathAliases.slice() : []
    };
    W.state.entities[e.id] = e;
    if (kind === "agent") {
      W.events.append({
        type: "agent.registered",
        actor: { kind: "system", id: "system" },
        entity: e.id,
        data: { name: e.name, role: e.attrs.role || null }
      });
    }
    persist();
    return W.util.clone(e);
  }

  function get(id) {
    var e = live(id);
    return e ? W.util.clone(e) : null;
  }

  // find(kind, q?) — q = case-insensitive name substring, sorted by name
  function find(kind, q) {
    var out = [];
    var needle = q == null ? null : String(q).toLowerCase();
    for (var id in W.state.entities) {
      var e = W.state.entities[id];
      if (e.kind !== kind) continue;
      if (needle && e.name.toLowerCase().indexOf(needle) < 0) continue;
      out.push(W.util.clone(e));
    }
    out.sort(function (a, b) {
      var al = a.name.toLowerCase(), bl = b.name.toLowerCase();
      if (al < bl) return -1;
      if (al > bl) return 1;
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; // tiebreak: raw name
    });
    return out;
  }

  // rename(id, newName, newPath?) — keeps id; old name/path pushed into pathAliases
  function rename(id, newName, newPath) {
    var e = live(id);
    if (!e) throw new Error("entities.rename: unknown id " + id);
    if (!newName) throw new Error("entities.rename: newName is required");
    var oldName = e.name;
    var oldPath = e.attrs.path != null ? e.attrs.path : null;
    e.pathAliases.push(oldName);
    if (oldPath) e.pathAliases.push(oldPath);
    e.name = newName;
    if (newPath !== undefined) e.attrs.path = newPath;
    if (e.kind === "file") {
      W.events.append({
        type: "file.renamed",
        actor: { kind: "system", id: "system" },
        entity: id,
        data: {
          oldName: oldName,
          newName: newName,
          oldPath: oldPath,
          newPath: newPath === undefined ? null : newPath
        }
      });
    }
    persist();
    return W.util.clone(e);
  }

  // _live is internal (graph.js and friends need the mutable record)
  W.entities = { register: register, get: get, find: find, rename: rename, _live: live };
})();
