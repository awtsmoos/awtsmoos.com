// B"H
(function cssCompiler(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};
  const ATOMS = [
    ["display", "block"], ["display", "grid"], ["display", "flex"], ["display", "none"],
    ["position", "relative"], ["position", "absolute"], ["position", "fixed"],
    ["padding", "0"], ["padding", "10px"], ["padding", "12px"], ["padding", "14px"], ["padding", "16px"], ["padding", "18px"], ["padding", "24px"], ["padding", "28px"], ["padding", "10px 16px"],
    ["margin", "0"], ["gap", "10px"], ["gap", "12px"],
    ["border", "0"], ["border-radius", "12px"], ["border-radius", "14px"], ["border-radius", "18px"], ["border-radius", "24px"], ["border-radius", "999px"],
    ["background", "#02050a"], ["background", "#06141f"], ["background", "#071923"], ["background", "#0d3340"], ["background", "#123"],
    ["color", "#eaffff"], ["color", "#eef"], ["color", "#73fff2"], ["color", "#001"],
    ["width", "100%"], ["height", "100%"], ["touch-action", "none"], ["list-style", "none"], ["font-weight", "900"],
    ["grid-template-columns", "repeat(3,1fr)"], ["grid-template-columns", "repeat(4,1fr)"],
    ["opacity", "0"], ["opacity", "1"], ["overflow", "hidden"], ["box-sizing", "border-box"]
  ];

  /**
   * B"H. CSS now has an atom lane. When a declaration is one of the common
   * property/value pairs of the web, it becomes a tiny atom ID and may share a
   * byte with neighbors. Unusual CSS still falls back to the typed declaration
   * river. The atom table is generic browser CSS, not demo-specific magic.
   */
  function parseCss(src, pools, ops, publicSymbols) {
    let index = 0;
    while (index < src.length) {
      const selector = ns.readUntil(src, index, "{");
      if (!selector.value) break;
      markPublic(selector.value, publicSymbols);
      const body = ns.readUntil(src, selector.next + 1, "}");
      ruleOps(selector.value, body.value, pools).forEach(op => ops.push(op));
      index = body.next + 1;
    }
  }

  function ruleOps(selector, body, pools) {
    const decls = declarations(body, pools);
    const out = selectorOps(selector, pools);
    const atomRun = atomRunRecipe(decls);
    if (atomRun) out.push(atomRun);
    else {
      const group = groupRecipe(decls);
      if (group) out.push(group); else decls.forEach(op => out.push(op));
    }
    return out;
  }

  function selectorOps(selector, pools) {
    const ids = root.AwtsEctIds;
    const parts = ns.splitSpaces(selector);
    if (parts.length === 2 && parts[0][0] === ".") return [[ids.ops.PHRASE, phraseId("SELECT_CLASS_DESC_TAG"), ns.ref(pools.sym, parts[0].slice(1)), ns.builtin(ids.tags, ns.lower(parts[1]), pools.custom)]];
    if (parts.length === 1 && parts[0][0] === ".") return [[ids.ops.CSS_CLASS, ns.ref(pools.sym, parts[0].slice(1))]];
    if (parts.length === 1 && parts[0][0] === "#") return [[ids.ops.CSS_ID, ns.ref(pools.sym, parts[0].slice(1))]];
    return parts.map(part => [ids.ops.CSS_TAG, ns.builtin(ids.tags, ns.lower(part), pools.custom)]);
  }

  function declarations(body, pools) {
    const ids = root.AwtsEctIds;
    const out = [];
    ns.splitBy(body, ";").forEach(item => {
      const at = item.indexOf(":");
      if (at < 1) return;
      const prop = ns.trim(item.slice(0, at));
      const value = normalizeValue(ns.trim(item.slice(at + 1)));
      const atom = atomId(prop, value);
      if (atom >= 0) out.push([ids.ops.CSS_ATOM, atom]);
      else out.push([ids.ops.CSS_DECL, ns.builtin(ids.cssProps, prop, pools.custom)].concat(cssValue(value, pools)));
    });
    return out;
  }

  function atomRunRecipe(decls) {
    const ids = root.AwtsEctIds;
    if (decls.length < 2) return null;
    const out = [ids.ops.CSS_ATOM_RUN, decls.length];
    for (let index = 0; index < decls.length; index += 1) {
      if (decls[index][0] !== ids.ops.CSS_ATOM) return null;
      out.push(decls[index][1]);
    }
    return out;
  }

  function groupRecipe(decls) {
    if (decls.length < 3) return null;
    const ids = root.AwtsEctIds;
    const out = [ids.ops.PHRASE, phraseId("CSS_DECL_GROUP"), decls.length];
    decls.forEach(op => {
      if (op[0] === ids.ops.CSS_ATOM) out.push(-999, op[1]);
      else {
        out.push(op[1]);
        for (let index = 2; index < Math.min(op.length, 6); index += 1) out.push(op[index]);
      }
    });
    return out.slice(0, 34);
  }

  function cssValue(value, pools) {
    const ids = root.AwtsEctIds;
    const gradient = linearGradient(value);
    if (gradient) return [6, ns.smallNumOrRef(gradient.angle, pools), color(gradient.a, pools), color(gradient.b, pools)];
    const repeat = cssRepeat(value, pools);
    if (repeat) return repeat;
    const pair = dimensionPair(value);
    if (pair) return [7, ns.smallNumOrRef(pair.a, pools), unit(pair.au), ns.smallNumOrRef(pair.b, pools), unit(pair.bu)];
    const dim = dimension(value);
    if (dim) return [2, ns.smallNumOrRef(dim.num, pools), unit(dim.unit)];
    if (ns.isColor(value)) return [1, color(value, pools)];
    if (ns.isNumber(value)) return [3, ns.smallNumOrRef(value, pools)];
    const keyword = ids.cssKeywords.indexOf(value);
    return keyword >= 0 ? [5, keyword] : [4, ns.ref(pools.text, value)];
  }

  function linearGradient(value) {
    if (!ns.startsAt(value, "linear-gradient(", 0)) return null;
    const inner = value.slice("linear-gradient(".length, -1);
    const parts = ns.splitBy(inner, ",").map(ns.trim);
    return parts.length >= 3 && ns.endsWith(parts[0], "deg") ? { angle: parts[0].slice(0, -3), a: parts[1], b: parts[2] } : null;
  }

  function cssRepeat(value, pools) {
    if (!ns.startsAt(value, "repeat(", 0)) return null;
    const parts = ns.splitBy(value.slice(7, -1), ",").map(ns.trim);
    if (parts.length !== 2) return null;
    const dim = dimension(parts[1]);
    return dim ? [8, ns.smallNumOrRef(parts[0], pools), ns.smallNumOrRef(dim.num, pools), unit(dim.unit)] : null;
  }

  function dimensionPair(value) {
    const parts = ns.splitSpaces(value);
    if (parts.length !== 2) return null;
    const a = dimension(parts[0]);
    const b = dimension(parts[1]);
    return a && b ? { a: a.num, au: a.unit, b: b.num, bu: b.unit } : null;
  }

  function dimension(value) {
    const units = root.AwtsEctIds.units;
    for (let index = 0; index < units.length; index += 1) {
      const unit = units[index];
      if (ns.endsWith(value, unit)) {
        const num = value.slice(0, value.length - unit.length);
        if (ns.isNumber(num)) return { num, unit };
      }
    }
    return null;
  }

  function normalizeValue(value) { return ns.splitSpaces(value).join(" "); }
  function atomId(prop, value) {
    for (let index = 0; index < ATOMS.length; index += 1) if (ATOMS[index][0] === prop && ATOMS[index][1] === value) return index;
    return -1;
  }

  function markPublic(selector, publicSymbols) {
    ns.splitSpaces(selector).forEach(part => {
      if (part[0] === "." || part[0] === "#") publicSymbols[part.slice(1)] = true;
    });
  }

  function unit(name) { const id = root.AwtsEctIds.units.indexOf(name); return id < 0 ? 0 : id; }
  function color(value, pools) { return ns.ref(pools.color, ns.lower(value)); }
  function phraseId(name) { const list = root.AwtsEctIds.phrases; let id = list.indexOf(name); if (id < 0) id = list.push(name) - 1; return id; }

  ns.parseCss = parseCss;
})(typeof self !== "undefined" ? self : globalThis);
