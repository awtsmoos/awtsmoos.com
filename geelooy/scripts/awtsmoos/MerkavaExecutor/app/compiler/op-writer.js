// B"H
(function opWriter(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};

  /**
   * B"H. Lean op writer. The decoder knows operand arity by opcode/phrase, so
   * we do not store operand counts here. This beats the generic compact-lane
   * experiment on tiny and medium semantic streams.
   */
  function writePools(writer, pools) {
    [pools.text, pools.sym, pools.num, pools.color, pools.custom].forEach(pool => {
      writer.tiny(pool.length);
      pool.forEach(value => writer.text(value));
    });
  }

  function writeOps(writer, ops) {
    const ids = root.AwtsEctIds;
    writer.tiny(ops.length);
    ops.forEach(op => {
      if (op[0] === ids.ops.AST_NODE) {
        writer.write(op[1], 8);
        if ((op[1] & 63) === 63 && op.length > 2) writer.tiny(op[2]);
        return;
      }
      writer.enum(op[0], 128);
      for (let index = 1; index < op.length; index += 1) operand(writer, op[index]);
    });
  }

  function operand(writer, value) {
    if (value < 0) { writer.write(1, 1); writer.tiny(-value); }
    else { writer.write(0, 1); writer.tiny(value); }
  }

  function compressRuns(ops) {
    const ids = root.AwtsEctIds;
    const out = [];
    for (let index = 0; index < ops.length; index += 1) {
      const repeat = repeatAt(ops, index);
      if (repeat.count > 1) {
        out.push([ids.ops.REPEAT, repeat.size, repeat.count]);
        index += repeat.size * repeat.count - 1;
      } else out.push(ops[index]);
    }
    return out;
  }

  function repeatAt(ops, start) {
    for (let size = 8; size >= 2; size -= 1) {
      const key = chunk(ops, start, size);
      let count = 1;
      while (key && chunk(ops, start + count * size, size) === key) count += 1;
      if (count > 1) return { size, count };
    }
    return { size: 0, count: 0 };
  }

  function chunk(ops, start, size) {
    if (start + size > ops.length) return "";
    let out = "";
    for (let index = start; index < start + size; index += 1) out += ops[index].join(":") + "|";
    return out;
  }

  ns.writePools = writePools;
  ns.writeOps = writeOps;
  ns.compressRuns = compressRuns;
})(typeof self !== "undefined" ? self : globalThis);
