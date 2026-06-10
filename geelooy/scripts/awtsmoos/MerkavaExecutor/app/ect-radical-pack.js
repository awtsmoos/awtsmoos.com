// B"H
(function radicalPack(root) {
  const ect = root.AwtsECT;

  /** B"H. Whole-project semantic universe: parse, recipe-collapse, bit-pack. */
  function packProject(project) {
    const pools = ect.rad.pool();
    const html = ect.rad.parseHtml(ect.rad.files(project, ".html"), pools);
    const css = ect.rad.parseCss(ect.rad.files(project, ".css"), pools);
    const js = ect.rad.parseJs(ect.rad.files(project, ".js"), pools);
    const ops = collapseAll(html.concat(css, js), pools);
    const writer = new ect.rad.Writer();
    writer.write(0xAB, 8); writer.write(3, 4);
    writePools(writer, pools);
    writeOps(writer, ops);
    const original = ect.rad.bytesOf(ect.rad.originalText(project));
    return withMetrics({ mode: "radical recipe bitcode", bytes: writer.bytes, bitLength: writer.bitLength, project, payloadKind: "whole-project-semantic-recipes", detail: details(pools, ops, writer) }, original);
  }

  function collapseAll(ops, pools) {
    const out = [];
    for (let i = 0; i < ops.length; i += 1) {
      const repeat = repeatedAt(ops, i);
      if (repeat.count > 1) { out.push([50, repeat.len, repeat.count]); i += repeat.len * repeat.count - 1; }
      else out.push(ops[i]);
    }
    return out;
  }

  function repeatedAt(ops, index) {
    for (let len = 6; len >= 2; len -= 1) {
      const key = chunk(ops, index, len);
      let count = 1;
      while (chunk(ops, index + count * len, len) === key) count += 1;
      if (count > 1) return { len, count };
    }
    return { len: 0, count: 0 };
  }

  function chunk(ops, index, len) {
    if (index + len > ops.length) return "";
    return ops.slice(index, index + len).map(op => op.join(":")) .join("|");
  }

  function writePools(w, pools) {
    [pools.strings, pools.symbols, pools.nums, pools.colors, pools.custom].forEach(pool => {
      w.tiny(pool.length);
      pool.forEach(value => w.text(value));
    });
  }

  function writeOps(w, ops) {
    w.tiny(ops.length);
    ops.forEach(op => { w.enum(op[0], 64); for (let i = 1; i < op.length; i += 1) writeOperand(w, op[i]); });
  }

  function writeOperand(w, value) {
    if (value < 0) { w.write(1, 1); w.tiny(-value); return; }
    w.write(0, 1); w.tiny(value);
  }

  function withMetrics(code, original) {
    code.analysis = ect.analyzeProject(code.project);
    code.metrics = { originalSourceBytes: original, storageBits: code.bitLength, storageBytes: code.bytes.length, compressionX: +(original / Math.max(1, code.bytes.length)).toFixed(2), bytesSaved: original - code.bytes.length, finalByteUsedBits: code.bitLength & 7 || 8, logicalWasteBits: 0, mode: code.mode, payloadKind: code.payloadKind, detail: code.detail, honestPayload: true };
    return code;
  }

  function details(pools, ops, writer) { return { strings: pools.strings.length, symbols: pools.symbols.length, numbers: pools.nums.length, colors: pools.colors.length, custom: pools.custom.length, ops: ops.length, bitLength: writer.bitLength }; }

  ect.packProject = packProject;
})(window);
