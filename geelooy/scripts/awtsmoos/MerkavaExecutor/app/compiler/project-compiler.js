// B"H
(function projectCompiler(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};
  const encoder = new TextEncoder();

  /**
   * B"H. Central chamber. Languages emit semantic ops, run folding compresses
   * repetition, pool compaction burns away dead strings, reconstruction proves
   * the vessel can breathe back into JS/CSS/HTML-shaped form, then bits descend.
   */
  function compileProject(project, Parser, options) {
    const settings = Object.assign({
      profile: "maximumSemantic",
      mangleLocalIdentifiers: true,
      preservePublicSymbols: false,
      preserveText: false,
      preserveExactSource: false,
      preserveComments: false,
      includeInternalMagic: false
    }, options || {});
    const pools = ns.makePools();
    const publicSymbols = ns.makePublicSymbols();
    const ops = [];
    pools.__settings = settings;
    ns.parseHtml(joinFiles(project, ".html"), pools, ops, publicSymbols);
    ns.parseCss(joinFiles(project, ".css"), pools, ops, publicSymbols);
    pools.__publicSymbols = publicSymbols;
    ns.parseJs(joinFiles(project, ".js"), pools, ops, Parser, ns.makeScope(settings, publicSymbols));
    delete pools.__publicSymbols;
    delete pools.__settings;
    const packedOps = ns.compressRuns(ops);
    const compacted = compactPools(pools, packedOps);
    const reconstruction = ns.reconstructProject ? ns.reconstructProject(compacted.ops, compacted.pools, publicSymbols) : null;
    const writer = new ns.BitWriter();
    if (settings.includeInternalMagic) {
      writer.write(0xAC, 8);
      writer.write(8, 4);
    }
    ns.writePools(writer, compacted.pools);
    ns.writeOps(writer, compacted.ops);
    return result(project, writer, ops, compacted.ops, compacted.pools, settings, compacted.stats, reconstruction, publicSymbols);
  }

  function compactPools(pools, ops) {
    const marks = makeMarks();
    ops.forEach(op => markOp(op, marks));
    const text = remapPool(pools.text, marks.text);
    const sym = remapPool(pools.sym, marks.sym);
    const num = remapPool(pools.num, marks.num);
    const color = remapPool(pools.color, marks.color);
    const custom = remapPool(pools.custom, marks.custom);
    const maps = { text, sym, num, color, custom };
    return {
      pools: { text: text.pool, sym: sym.pool, num: num.pool, color: color.pool, custom: custom.pool },
      ops: ops.map(op => remapOp(op, maps)),
      stats: { before: sizes(pools), after: sizes({ text: text.pool, sym: sym.pool, num: num.pool, color: color.pool, custom: custom.pool }) }
    };
  }

  function makeMarks() { return { text: Object.create(null), sym: Object.create(null), num: Object.create(null), color: Object.create(null), custom: Object.create(null) }; }

  function markOp(op, marks) {
    const ids = root.AwtsEctIds;
    if (!op || !op.length) return;
    if (op[0] === ids.ops.HTML_TEXT) mark(marks.text, op[1]);
    else if (op[0] === ids.ops.AST_STRING && op[1] < 0) return;
    else if (op[0] === ids.ops.AST_STRING && op[1] < 0) return;
    else if (op[0] === ids.ops.HTML_ATTR) markMaybeCustom(marks, op[1]);
    else if (op[0] === ids.ops.CSS_TAG) markMaybeCustom(marks, op[1]);
    else if (op[0] === ids.ops.CSS_DECL) markCssDecl(op, 1, marks);
    else if (op[0] === ids.ops.PHRASE) markPhrase(op, marks);
    else markGeneric(op, marks);
  }

  function markPhrase(op, marks) {
    const name = root.AwtsEctIds.phrases[op[1]] || "";
    if (name === "HTML_SHELL_CLASS_CHILDREN" || name === "HTML_SHELL_ID_CHILDREN") { markMaybeCustom(marks, op[2]); return; }
    if (name === "SELECT_CLASS_DESC_TAG") { markMaybeCustom(marks, op[3]); return; }
    if (name === "CSS_DECL_GROUP" || name === "CSS_PANEL_THEME") { markCssGroup(op, 3, op[2], marks); return; }
    if (name === "CANVAS_GET_CONTEXT" || name === "LIT_TEXT") { mark(marks.text, op[2]); return; }
    markPhrasePayload(op, 2, marks);
  }

  function markCssGroup(op, start, count, marks) {
    let index = start;
    for (let item = 0; item < count && index < op.length; item += 1) { markCssDecl(op, index, marks); index += 6; }
  }

  function markCssDecl(op, propIndex, marks) {
    markMaybeCustom(marks, op[propIndex]);
    const kind = op[propIndex + 1];
    if (kind === 1) mark(marks.color, op[propIndex + 2]);
    else if (kind === 2 || kind === 3) markEncodedNum(marks, op[propIndex + 2]);
    else if (kind === 4) mark(marks.text, op[propIndex + 2]);
    else if (kind === 6) { markEncodedNum(marks, op[propIndex + 2]); mark(marks.color, op[propIndex + 3]); mark(marks.color, op[propIndex + 4]); }
    else if (kind === 7) { markEncodedNum(marks, op[propIndex + 2]); markEncodedNum(marks, op[propIndex + 4]); }
    else if (kind === 8) { markEncodedNum(marks, op[propIndex + 2]); markEncodedNum(marks, op[propIndex + 3]); }
  }

  function markPhrasePayload(op, start, marks) { for (let index = start; index < op.length; index += 1) markPossibleReference(op, index, marks); }
  function markGeneric(op, marks) { for (let index = 1; index < op.length; index += 1) markPossibleReference(op, index, marks); }

  function markPossibleReference(op, index, marks) {
    const value = op[index], prev = op[index - 1];
    if (prev === 2) mark(marks.text, value);
    if (prev === 1 || prev === 3) markEncodedNum(marks, value);
    if (prev === 5 || prev === 6) markMaybeCustom(marks, value);
    if (value < 0) markMaybeCustom(marks, value);
    if (value >= 128) markEncodedNum(marks, value);
  }

  function markEncodedNum(marks, value) { if (value >= 128) mark(marks.num, value - 128); }
  function markMaybeCustom(marks, value) { if (typeof value === "number" && value < 0) mark(marks.custom, -value - 1); }
  function mark(set, value) { if (typeof value === "number" && value >= 0) set[value] = true; }

  function remapPool(pool, marks) {
    const next = [], map = Object.create(null);
    for (let index = 0; index < pool.length; index += 1) if (marks[index]) { map[index] = next.length; next.push(pool[index]); }
    return { pool: next, map };
  }

  function remapOp(op, maps) {
    const ids = root.AwtsEctIds;
    const next = op.slice();
    if (op[0] === ids.ops.HTML_TEXT) next[1] = remap(next[1], maps.text);
    else if (op[0] === ids.ops.AST_STRING && op[1] < 0) return next;
    else if (op[0] === ids.ops.AST_STRING && op[1] < 0) return next;
    else if (op[0] === ids.ops.HTML_ATTR) next[1] = remapCustom(next[1], maps.custom);
    else if (op[0] === ids.ops.CSS_TAG) next[1] = remapCustom(next[1], maps.custom);
    else if (op[0] === ids.ops.CSS_DECL) remapCssDecl(next, 1, maps);
    else if (op[0] === ids.ops.PHRASE) remapPhrase(next, maps);
    return next;
  }

  function remapPhrase(op, maps) {
    const name = root.AwtsEctIds.phrases[op[1]] || "";
    if (name === "HTML_SHELL_CLASS_CHILDREN" || name === "HTML_SHELL_ID_CHILDREN") { op[2] = remapCustom(op[2], maps.custom); return; }
    if (name === "SELECT_CLASS_DESC_TAG") { op[3] = remapCustom(op[3], maps.custom); return; }
    if (name === "CSS_DECL_GROUP" || name === "CSS_PANEL_THEME") { remapCssGroup(op, 3, op[2], maps); return; }
    if (name === "CANVAS_GET_CONTEXT" || name === "LIT_TEXT") { op[2] = remap(op[2], maps.text); return; }
    remapPhrasePayload(op, 2, maps);
  }

  function remapCssGroup(op, start, count, maps) {
    let index = start;
    for (let item = 0; item < count && index < op.length; item += 1) { remapCssDecl(op, index, maps); index += 6; }
  }

  function remapCssDecl(op, propIndex, maps) {
    op[propIndex] = remapCustom(op[propIndex], maps.custom);
    const kind = op[propIndex + 1];
    if (kind === 1) op[propIndex + 2] = remap(op[propIndex + 2], maps.color);
    else if (kind === 2 || kind === 3) op[propIndex + 2] = remapEncodedNum(op[propIndex + 2], maps.num);
    else if (kind === 4) op[propIndex + 2] = remap(op[propIndex + 2], maps.text);
    else if (kind === 6) { op[propIndex + 2] = remapEncodedNum(op[propIndex + 2], maps.num); op[propIndex + 3] = remap(op[propIndex + 3], maps.color); op[propIndex + 4] = remap(op[propIndex + 4], maps.color); }
    else if (kind === 7) { op[propIndex + 2] = remapEncodedNum(op[propIndex + 2], maps.num); op[propIndex + 4] = remapEncodedNum(op[propIndex + 4], maps.num); }
    else if (kind === 8) { op[propIndex + 2] = remapEncodedNum(op[propIndex + 2], maps.num); op[propIndex + 3] = remapEncodedNum(op[propIndex + 3], maps.num); }
  }

  function remapPhrasePayload(op, start, maps) {
    for (let index = start; index < op.length; index += 1) {
      if (op[index] < 0) op[index] = remapCustom(op[index], maps.custom);
      if (op[index] >= 128) op[index] = remapEncodedNum(op[index], maps.num);
      if (op[index - 1] === 2) op[index] = remap(op[index], maps.text);
    }
  }

  function remap(value, item) { return typeof value === "number" && value >= 0 && Object.prototype.hasOwnProperty.call(item.map, value) ? item.map[value] : value; }
  function remapCustom(value, item) { if (typeof value !== "number" || value >= 0) return value; const old = -value - 1; return Object.prototype.hasOwnProperty.call(item.map, old) ? -(item.map[old] + 1) : value; }
  function remapEncodedNum(value, item) { if (typeof value !== "number" || value < 128) return value; const old = value - 128; return Object.prototype.hasOwnProperty.call(item.map, old) ? 128 + item.map[old] : value; }

  function result(project, writer, rawOps, packedOps, pools, settings, compactStats, reconstruction, publicSymbols) {
    const original = bytes(projectText(project));
    return {
      bytes: writer.bytes.slice(0, 512),
      byteCount: writer.bytes.length,
      bitLength: writer.bitLength,
      reconstruction,
      preservation: settings,
      publicSymbols: publicSymbols.names.slice(),
      metrics: {
        originalSourceBytes: original,
        storageBytes: writer.bytes.length,
        storageBits: writer.bitLength,
        compressionX: ns.round(original / Math.max(1, writer.bytes.length)),
        mode: "reconstructable modular semantic grammar bitcode",
        payloadKind: "semantic-js-html-css-reconstructable-ir",
        detail: { ops: packedOps.length, rawOps: rawOps.length, pools: sizes(pools), poolCompaction: compactStats, reconstruction: reconstruction && reconstruction.proof, preservation: settings }
      },
      universe: { pools: sizes(pools), files: Object.keys(project.files), opCount: packedOps.length, rawOpCount: rawOps.length, dictionaries: dictionaryStats() }
    };
  }

  function dictionaryStats() {
    const ids = root.AwtsEctIds;
    return { roots: ids.roots.length, memberFamilies: Object.keys(ids.members).length, memberIds: Object.keys(ids.members).reduce((sum, key) => sum + ids.members[key].length, 0), tags: ids.tags.length, attrs: ids.attrs.length, props: ids.cssProps.length, astNodeTypes: ids.astNodes.length, phrases: ids.phrases.length };
  }

  function joinFiles(project, ext) { return Object.keys(project.files).filter(name => ns.endsWith(name, ext)).map(name => project.files[name]).join("\n"); }
  function projectText(project) { return Object.keys(project.files).map(name => "// FILE: " + name + "\n" + project.files[name]).join("\n\n"); }
  function bytes(value) { return encoder.encode(String(value || "")).length; }
  function sizes(pools) { return { text: pools.text.length, symbols: pools.sym.length, numbers: pools.num.length, colors: pools.color.length, custom: pools.custom.length }; }

  root.AwtsEctCompiler = { compileProject };
})(typeof self !== "undefined" ? self : globalThis);
