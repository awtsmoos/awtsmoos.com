// B"H
(function opWriter(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};
  const PHRASE_NAMES = [
    "GEN_CALL", "GEN_EXPR_STMT", "GEN_RETURN", "GEN_MEMBER_PATH",
    "GEN_ASSIGN", "GEN_BINARY", "GEN_LOGICAL", "GEN_UPDATE",
    "GEN_VAR_DECL", "DECL_SLOT_FROM_PHRASE", "FUNC_SLOT",
    "HTML_SHELL_CLASS_CHILDREN", "HTML_SHELL_ID_CHILDREN",
    "SELECT_CLASS_DESC_TAG", "HTML_TREE_NODE", "DECL_CONST_FROM_CALL", "DECL_CONST_FROM_CALL", "DECL_OBJECT_LITERAL", "DECL_LET_NUMBER",
    "ADD_ASSIGN", "CALL0_EXPR", "CALL_EXPR", "CSS_KEYFRAMES", "CSS_AT_RULE", "CSS_KEYFRAMES", "CSS_AT_RULE", "CALL_EXPR"
  ];

  /**
   * B"H. Dense reconstructable bit-writer.
   *
   * The stream is a river of schema lanes. Common grammar fragments do not pay
   * for generic phrase envelopes. A tiny declaration such as `const _$0 = 3`
   * can become one micro lane: declaration kind, local slot, and immediate
   * numeric payload, sharing the byte with whatever follows.
   */
  function writePools(writer, pools) {
    const groups = [pools.text, pools.sym, pools.num, pools.color, pools.custom];
    const total = groups.reduce((sum, pool) => sum + pool.length, 0);
    if (total === 0) { writer.write(0, 1); return; }
    writer.write(1, 1);
    groups.forEach(pool => {
      writer.tiny(pool.length);
      pool.forEach(value => writer.text(value));
    });
  }

  function writeOps(writer, ops) {
    const ids = root.AwtsEctIds;
    writer.tiny(ops.length);
    ops.forEach(op => {
      if (op[0] === ids.ops.PHRASE && writeKnownPhrase(writer, op)) return;
      if (op[0] === ids.ops.CSS_ATOM) return writeCssAtom(writer, op);
      if (op[0] === ids.ops.CSS_ATOM_RUN) return writeCssAtomRun(writer, op);
      if (op[0] === ids.ops.CSS_DECL) return writeCssDecl(writer, op, 1);
      if (op[0] === ids.ops.AST_NODE) return writeAstNode(writer, op);
      writer.enum(op[0], 128);
      for (let index = 1; index < op.length; index += 1) operand(writer, op[index]);
    });
  }

  function writeKnownPhrase(writer, op) {
    const name = root.AwtsEctIds.phrases[op[1]] || "";
    if (name === "DECL_CONST_FROM_CALL") return writeDeclCallPhrase(writer, op, 2);
    if (name === "DECL_CONST_FROM_CALL") return writeDeclCallPhrase(writer, op, 2);
    if (name === "DECL_OBJECT_LITERAL") return writeDeclObjectPhrase(writer, op, 2);
    if (name === "DECL_LET_NUMBER") return writeTinyNumberDecl(writer, op);
    const code = PHRASE_NAMES.indexOf(name);
    if (code < 0) return false;
    writer.write(5, 3);
    writer.write(code, 5);
    if (name === "GEN_CALL" || name === "CALL_EXPR") return writeCallPhrase(writer, op, 2);
    if (name === "CALL0_EXPR") return writeSingleAtomPhrase(writer, op, 2);
    if (name === "GEN_EXPR_STMT" || name === "GEN_RETURN" || name === "GEN_MEMBER_PATH") return writeSingleAtomPhrase(writer, op, 2);
    if (name === "ADD_ASSIGN") return writeTwoAtomPhrase(writer, op, 2);
    if (name === "GEN_ASSIGN" || name === "GEN_BINARY" || name === "GEN_LOGICAL") return writeBinaryPhrase(writer, op, 2);
    if (name === "GEN_UPDATE") return writeUpdatePhrase(writer, op, 2);
    if (name === "GEN_VAR_DECL") return writeVarDeclPhrase(writer, op, 2);
    if (name === "DECL_SLOT_FROM_PHRASE") return writeDeclSlotPhrase(writer, op, 2);
    if (name === "FUNC_SLOT") { writer.tiny(op[2]); writer.tiny(op[3] || 0); return true; }
    if (name === "HTML_SHELL_CLASS_CHILDREN" || name === "HTML_SHELL_ID_CHILDREN") { writer.tiny(op[2]); writer.tiny(op[3]); writer.tiny(op[4]); return true; }
    if (name === "SELECT_CLASS_DESC_TAG") { writer.tiny(op[2]); operand(writer, op[3]); return true; }
    if (name === "HTML_TREE_NODE") return writeHtmlTreeNode(writer, op, 2);
    if (name === "CSS_KEYFRAMES") return writeCssKeyframes(writer, op, 2);
    if (name === "CSS_AT_RULE") { writer.tiny(op[2]); writer.tiny(op[3]); writer.tiny(op[4]); return true; }
    if (name === "CSS_KEYFRAMES") return writeCssKeyframes(writer, op, 2);
    if (name === "CSS_AT_RULE") { writer.tiny(op[2]); writer.tiny(op[3]); writer.tiny(op[4]); return true; }
    return false;
  }

  function writeTinyNumberDecl(writer, op) {
    const kind = op[2], slot = op[3], value = op[4];
    writer.write(1, 3);
    writer.write(Math.min(kind, 3), 2);
    if (slot < 4 && value >= 0 && value < 16) {
      writer.write(0, 1);
      writer.write(slot, 2);
      writer.write(value, 4);
      return true;
    }
    if (slot < 8 && value >= 0 && value < 64) {
      writer.write(1, 2);
      writer.write(slot, 3);
      writer.write(value, 6);
      return true;
    }
    writer.write(3, 2);
    writer.tiny(slot);
    writeNum(writer, value);
    return true;
  }

  function writeCssAtom(writer, op) { writer.write(6, 3); writer.tiny(op[1]); }
  function writeCssAtomRun(writer, op) { writer.write(7, 3); writer.tiny(op[1]); for (let i = 2; i < op.length; i += 1) writer.tiny(op[i]); }
  function writeAstNode(writer, op) { writer.write(op[1], 8); if ((op[1] & 63) === 63 && op.length > 2) writer.tiny(op[2]); }

  function writeCssKeyframes(writer, op, index) {
    writer.tiny(op[index]);
    const count = op[index + 1];
    writer.tiny(count);
    let cursor = index + 2;
    for (let item = 0; item < count; item += 1) {
      writer.tiny(op[cursor]);
      const payloadLength = op[cursor + 1];
      writer.tiny(payloadLength);
      cursor += 2;
      for (let part = 0; part < payloadLength; part += 1) operand(writer, op[cursor + part]);
      cursor += payloadLength;
    }
    return true;
  }

  function writeCssKeyframes(writer, op, index) {
    writer.tiny(op[index]);
    const count = op[index + 1];
    writer.tiny(count);
    let cursor = index + 2;
    for (let item = 0; item < count; item += 1) {
      writer.tiny(op[cursor]);
      const payloadLength = op[cursor + 1];
      writer.tiny(payloadLength);
      cursor += 2;
      for (let part = 0; part < payloadLength; part += 1) operand(writer, op[cursor + part]);
      cursor += payloadLength;
    }
    return true;
  }

  function writeCssDecl(writer, op, index) {
    writer.write(4, 3);
    operand(writer, op[index]);
    writeCssValue(writer, op, index + 1);
  }

  function writeCssValue(writer, op, index) {
    const kind = op[index];
    writer.write(kind & 15, 4);
    if (kind === 1) { writer.tiny(op[index + 1]); return index + 2; }
    if (kind === 2) { writeNum(writer, op[index + 1]); writer.tiny(op[index + 2]); return index + 3; }
    if (kind === 3) { writeNum(writer, op[index + 1]); return index + 2; }
    if (kind === 4 || kind === 5) { writer.tiny(op[index + 1]); return index + 2; }
    if (kind === 6) { writeNum(writer, op[index + 1]); writer.tiny(op[index + 2]); writer.tiny(op[index + 3]); return index + 4; }
    if (kind === 7) { writeNum(writer, op[index + 1]); writer.tiny(op[index + 2]); writeNum(writer, op[index + 3]); writer.tiny(op[index + 4]); return index + 5; }
    if (kind === 8) { writeNum(writer, op[index + 1]); writeNum(writer, op[index + 2]); writer.tiny(op[index + 3]); return index + 4; }
    return index + 1;
  }

  function writeCallPhrase(writer, op, index) { writeCallPayload(writer, op, index); return true; }
  function writeSingleAtomPhrase(writer, op, index) { writeAtom(writer, op, index); return true; }
  function writeTwoAtomPhrase(writer, op, index) { writeAtom(writer, op, writeAtom(writer, op, index)); return true; }

  function writeBinaryPhrase(writer, op, index) {
    writer.tiny(op[index]);
    writeAtom(writer, op, writeAtom(writer, op, index + 1));
    return true;
  }

  function writeUpdatePhrase(writer, op, index) {
    writer.tiny(op[index]);
    writer.write(op[index + 1] ? 1 : 0, 1);
    writeAtom(writer, op, index + 2);
    return true;
  }

  function writeVarDeclPhrase(writer, op, index) {
    writer.tiny(op[index]);
    const count = op[index + 1];
    writer.tiny(count);
    let cursor = index + 2;
    for (let item = 0; item < count; item += 1) {
      writer.tiny(op[cursor]);
      cursor = writeInitPhrase(writer, op, cursor + 1);
    }
    return true;
  }

  function writeDeclObjectPhrase(writer, op, index) {
    writer.tiny(op[index]);
    writer.tiny(op[index + 1]);
    writeObjectShape(writer, op, index + 2);
    return true;
  }

  function writeDeclObjectPhrase(writer, op, index) {
    writer.tiny(op[index]);
    writer.tiny(op[index + 1]);
    writeObjectShape(writer, op, index + 2);
    return true;
  }

  function writeDeclCallPhrase(writer, op, index) {
    writer.tiny(op[index]);
    writer.tiny(op[index + 1]);
    writeCallPayload(writer, op, index + 2);
    return true;
  }

  function writeDeclCallPhrase(writer, op, index) {
    writer.tiny(op[index]);
    writer.tiny(op[index + 1]);
    writeCallPayload(writer, op, index + 2);
    return true;
  }

  function writeDeclSlotPhrase(writer, op, index) {
    writer.tiny(op[index]);
    writeInitPhrase(writer, op, index + 1);
    return true;
  }

  function writeInitPhrase(writer, op, index) {
    const phrase = op[index];
    writer.tiny(phrase);
    const name = root.AwtsEctIds.phrases[phrase] || "";
    if (name === "CALL_VALUE") return writeCallPayload(writer, op, index + 1);
    if (name === "OBJECT_SHAPE") return writeObjectShape(writer, op, index + 1);
    if (name === "LIT_UNDEFINED") return index + 1;
    return writeAtomBodyAfterKind(writer, phrase, op, index + 1);
  }

  function writeObjectShape(writer, op, index) {
    const count = op[index];
    writer.tiny(count);
    let cursor = index + 1;
    for (let item = 0; item < count; item += 1) {
      operand(writer, op[cursor]);
      cursor = writeAtom(writer, op, cursor + 1);
    }
    return cursor;
  }

  function writeCallPayload(writer, op, index) {
    const argCount = op[index];
    writer.tiny(argCount);
    let cursor = writeAtom(writer, op, index + 1);
    for (let item = 0; item < argCount; item += 1) cursor = writeAtom(writer, op, cursor);
    return cursor;
  }

  function writeAtom(writer, op, index) {
    const kind = op[index];
    writer.write(kind & 15, 4);
    return writeAtomBodyAfterKind(writer, kind, op, index + 1);
  }

  function writeAtomBodyAfterKind(writer, kind, op, index) {
    if (kind === 0 || kind === 1 || kind === 2 || kind === 3 || kind === 4 || kind === 11 || kind === 12 || kind === 13) { operand(writer, op[index]); return index + 1; }
    if (kind === 14) { writer.write(op[index], 24); return index + 1; }
    if (kind === 5) { writer.tiny(op[index]); operand(writer, op[index + 1]); return index + 2; }
    if (kind === 6) { const cursor = writeAtom(writer, op, index); operand(writer, op[cursor]); return cursor + 1; }
    if (kind === 9) return writeCallPayload(writer, op, index);
    if (kind === 10) { writer.tiny(op[index]); return writeAtom(writer, op, writeAtom(writer, op, index + 1)); }
    return index;
  }

  function writeHtmlTreeNode(writer, op, index) {
    operand(writer, op[index]);
    const attrCount = op[index + 1];
    writer.tiny(attrCount);
    writer.tiny(op[index + 2]);
    let cursor = index + 3;
    for (let item = 0; item < attrCount; item += 1) { operand(writer, op[cursor]); operand(writer, op[cursor + 1]); cursor += 2; }
    return true;
  }

  function writeNum(writer, value) { operand(writer, value); }
  function operand(writer, value) { if (value < 0) { writer.write(1, 1); writer.tiny(-value); } else { writer.write(0, 1); writer.tiny(value); } }

  function compressRuns(ops) {
    const ids = root.AwtsEctIds;
    const out = [];
    for (let index = 0; index < ops.length; index += 1) {
      const repeat = repeatAt(ops, index);
      if (repeat.count > 1) { out.push([ids.ops.REPEAT, repeat.size, repeat.count]); index += repeat.size * repeat.count - 1; }
      else out.push(ops[index]);
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
