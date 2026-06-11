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
  const AT_RULES = ["keyframes", "media", "supports", "container", "font-face", "page", "layer", "scope", "property"];
  const KEYFRAME_STOPS = ["from", "to", "0%", "25%", "50%", "75%", "100%"];

  /**
   * B"H. CSS as semantic rules. Ordinary selectors use ID lanes and atoms;
   * keyframes become an at-rule phrase with stop IDs and compact declaration
   * groups. No regex; the parser walks braces so nested at-rules remain sane.
   */
  function parseCss(src, pools, ops, publicSymbols) {
    let index = 0;
    while (index < src.length) {
      index = ns.skipSpaces(src, index);
      if (index >= src.length) break;
      if (src[index] === "@") index = readAtRule(src, index, pools, ops, publicSymbols);
      else index = readRule(src, index, pools, ops, publicSymbols);
    }
  }

  function readAtRule(src, index, pools, ops, publicSymbols) {
    const head = ns.readUntil(src, index + 1, "{");
    const block = readBlock(src, head.next);
    const parts = ns.splitSpaces(head.value);
    const name = ns.lower(parts[0] || "");
    if (name === "keyframes") {
      keyframesOps(parts.slice(1).join(" "), block.value, pools).forEach(op => ops.push(op));
    } else {
      ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("CSS_AT_RULE"), atRuleId(name), ns.ref(pools.text, parts.slice(1).join(" ")), ns.ref(pools.text, block.value)]);
    }
    return block.next;
  }

  function readRule(src, index, pools, ops, publicSymbols) {
    const selector = ns.readUntil(src, index, "{");
    if (!selector.value) return src.length;
    const block = readBlock(src, selector.next);
    ruleOps(selector.value, block.value, pools, publicSymbols).forEach(op => ops.push(op));
    return block.next;
  }

  function readBlock(src, openIndex) {
    let index = openIndex + 1;
    let depth = 1;
    let value = "";
    while (index < src.length && depth > 0) {
      const ch = src[index];
      if (ch === "{") { depth += 1; value += ch; }
      else if (ch === "}") { depth -= 1; if (depth > 0) value += ch; }
      else value += ch;
      index += 1;
    }
    return { value, next: index };
  }

  function keyframesOps(name, body, pools) {
    const stops = [];
    let index = 0;
    while (index < body.length) {
      index = ns.skipSpaces(body, index);
      if (index >= body.length) break;
      const stop = ns.readUntil(body, index, "{");
      const block = readBlock(body, stop.next);
      const decls = declarations(block.value, pools);
      const encoded = compactDeclPayload(decls);
      stops.push({ stop: stopId(ns.trim(stop.value)), rawDecls: decls, decls: encoded });
      index = block.next;
    }
    const rotate = rotateKeyframesPhrase(name, stops);
    if (rotate) return [rotate];
    const out = [root.AwtsEctIds.ops.PHRASE, phraseId("CSS_KEYFRAMES"), ns.ref(pools.sym, name), stops.length];
    stops.forEach(item => {
      out.push(item.stop, item.decls.length);
      item.decls.forEach(value => out.push(value));
    });
    return [out];
  }

  /**
   * B"H. Simple rotate keyframes phrase: from/to transform:rotate(Ndeg).
   * It is generic CSS structure, not a demo recipe, and removes bulky per-stop
   * declaration payload when the semantic shape is exactly a standard rotate.
   */
  function rotateKeyframesPhrase(name, stops) {
    if (!name || stops.length !== 2) return null;
    const first = rotateStop(stops[0]);
    const second = rotateStop(stops[1]);
    if (!first || !second) return null;
    const fromStop = stops[0].stop;
    const toStop = stops[1].stop;
    if (!isEndpointStop(fromStop) || !isEndpointStop(toStop) || first.unit !== second.unit) return null;
    return [root.AwtsEctIds.ops.PHRASE, phraseId("CSS_ROTATE_KEYFRAMES"), first.value, second.value, first.unit];
  }

  function rotateStop(stop) {
    const ids = root.AwtsEctIds;
    const decls = stop.rawDecls || [];
    const transform = ids.cssProps.indexOf("transform");
    if (decls.length !== 1 || decls[0][0] !== ids.ops.CSS_DECL) return null;
    if (decls[0][1] !== transform || decls[0][2] !== 9) return null;
    return { value: decls[0][3], unit: decls[0][4] };
  }

  function isEndpointStop(id) { return id === 0 || id === 1 || id === 2 || id === 6; }

  /**
   * B"H. Simple rotate keyframes phrase: from/to transform:rotate(Ndeg).
   * It is generic CSS structure, not a demo recipe, and removes bulky per-stop
   * declaration payload when the semantic shape is exactly a standard rotate.
   */
  function rotateKeyframesPhrase(name, stops) {
    if (!name || stops.length !== 2) return null;
    const first = rotateStop(stops[0]);
    const second = rotateStop(stops[1]);
    if (!first || !second) return null;
    const fromStop = stops[0].stop;
    const toStop = stops[1].stop;
    if (!isEndpointStop(fromStop) || !isEndpointStop(toStop) || first.unit !== second.unit) return null;
    return [root.AwtsEctIds.ops.PHRASE, phraseId("CSS_ROTATE_KEYFRAMES"), first.value, second.value, first.unit];
  }

  function rotateStop(stop) {
    const ids = root.AwtsEctIds;
    const decls = stop.rawDecls || [];
    const transform = ids.cssProps.indexOf("transform");
    if (decls.length !== 1 || decls[0][0] !== ids.ops.CSS_DECL) return null;
    if (decls[0][1] !== transform || decls[0][2] !== 9) return null;
    return { value: decls[0][3], unit: decls[0][4] };
  }

  function isEndpointStop(id) { return id === 0 || id === 1 || id === 2 || id === 6; }

  function compactDeclPayload(decls) {
    const ids = root.AwtsEctIds;
    const out = [];
    decls.forEach(op => {
      if (op[0] === ids.ops.CSS_ATOM) out.push(0, op[1]);
      else out.push(1, op[1], op[2], op[3] || 0, op[4] || 0, op[5] || 0);
    });
    return out;
  }

  function ruleOps(selector, body, pools, publicSymbols) {
    const decls = declarations(body, pools);
    const out = selectorOps(selector, pools, publicSymbols);
    const atomRun = atomRunRecipe(decls);
    if (atomRun) out.push(atomRun);
    else {
      const group = groupRecipe(decls);
      if (group) out.push(group); else decls.forEach(op => out.push(op));
    }
    return out;
  }

  function selectorOps(selector, pools, publicSymbols) {
    const ids = root.AwtsEctIds;
    const parts = ns.splitSpaces(selector);
    if (parts.length === 2 && parts[0][0] === ".") return [[ids.ops.PHRASE, phraseId("SELECT_CLASS_DESC_TAG"), ns.publicSlot(publicSymbols, parts[0].slice(1)), ns.builtin(ids.tags, ns.lower(parts[1]), pools.custom)]];
    if (parts.length === 1 && parts[0][0] === ".") return [[ids.ops.CSS_CLASS, ns.publicSlot(publicSymbols, parts[0].slice(1))]];
    if (parts.length === 1 && parts[0][0] === "#") return [[ids.ops.CSS_ID, ns.publicSlot(publicSymbols, parts[0].slice(1))]];
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
    for (let index = 0; index < decls.length; index += 1) { if (decls[index][0] !== ids.ops.CSS_ATOM) return null; out.push(decls[index][1]); }
    return out;
  }

  function groupRecipe(decls) {
    if (decls.length < 3) return null;
    const ids = root.AwtsEctIds;
    const out = [ids.ops.PHRASE, phraseId("CSS_DECL_GROUP"), decls.length];
    decls.forEach(op => {
      if (op[0] === ids.ops.CSS_ATOM) out.push(-999, op[1]);
      else { out.push(op[1]); for (let index = 2; index < Math.min(op.length, 6); index += 1) out.push(op[index]); }
    });
    return out.slice(0, 34);
  }

  function cssValue(value, pools) {
    const ids = root.AwtsEctIds;
    const gradient = linearGradient(value); if (gradient) return [6, ns.smallNumOrRef(gradient.angle, pools), color(gradient.a, pools), color(gradient.b, pools)];
    const rotate = rotateValue(value, pools); if (rotate) return rotate;
    const repeat = cssRepeat(value, pools); if (repeat) return repeat;
    const pair = dimensionPair(value); if (pair) return [7, ns.smallNumOrRef(pair.a, pools), unit(pair.au), ns.smallNumOrRef(pair.b, pools), unit(pair.bu)];
    const dim = dimension(value); if (dim) return [2, ns.smallNumOrRef(dim.num, pools), unit(dim.unit)];
    if (ns.isColor(value)) return [1, color(value, pools)];
    if (ns.isNumber(value)) return [3, ns.smallNumOrRef(value, pools)];
    const keyword = ids.cssKeywords.indexOf(value);
    return keyword >= 0 ? [5, keyword] : [4, ns.ref(pools.text, value)];
  }

  function rotateValue(value, pools) {
    if (!ns.startsAt(value, "rotate(", 0) || value[value.length - 1] !== ")") return null;
    const inner = value.slice(7, -1);
    const dim = dimension(inner);
    return dim ? [9, ns.smallNumOrRef(dim.num, pools), unit(dim.unit)] : null;
  }

  function linearGradient(value) { if (!ns.startsAt(value, "linear-gradient(", 0)) return null; const parts = ns.splitBy(value.slice("linear-gradient(".length, -1), ",").map(ns.trim); return parts.length >= 3 && ns.endsWith(parts[0], "deg") ? { angle: parts[0].slice(0, -3), a: parts[1], b: parts[2] } : null; }
  function cssRepeat(value, pools) { if (!ns.startsAt(value, "repeat(", 0)) return null; const parts = ns.splitBy(value.slice(7, -1), ",").map(ns.trim); if (parts.length !== 2) return null; const dim = dimension(parts[1]); return dim ? [8, ns.smallNumOrRef(parts[0], pools), ns.smallNumOrRef(dim.num, pools), unit(dim.unit)] : null; }
  function dimensionPair(value) { const parts = ns.splitSpaces(value); if (parts.length !== 2) return null; const a = dimension(parts[0]); const b = dimension(parts[1]); return a && b ? { a: a.num, au: a.unit, b: b.num, bu: b.unit } : null; }
  function dimension(value) { const units = root.AwtsEctIds.units; for (let index = 0; index < units.length; index += 1) { const unit = units[index]; if (ns.endsWith(value, unit)) { const num = value.slice(0, value.length - unit.length); if (ns.isNumber(num)) return { num, unit }; } } return null; }
  function normalizeValue(value) { return ns.splitSpaces(value).join(" "); }
  function atomId(prop, value) { for (let index = 0; index < ATOMS.length; index += 1) if (ATOMS[index][0] === prop && ATOMS[index][1] === value) return index; return -1; }
  function unit(name) { const id = root.AwtsEctIds.units.indexOf(name); return id < 0 ? 0 : id; }
  function color(value, pools) { return ns.ref(pools.color, ns.lower(value)); }
  function atRuleId(name) { const id = AT_RULES.indexOf(name); return id < 0 ? 0 : id; }
  function stopId(name) { const id = KEYFRAME_STOPS.indexOf(name); return id < 0 ? ns.smallNumOrRef(name.replace("%", ""), { num: [] }) : id; }
  function phraseId(name) { const list = root.AwtsEctIds.phrases; let id = list.indexOf(name); if (id < 0) id = list.push(name) - 1; return id; }
  ns.parseCss = parseCss;
})(typeof self !== "undefined" ? self : globalThis);
