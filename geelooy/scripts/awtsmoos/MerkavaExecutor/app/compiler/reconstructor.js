// B"H
(function reconstructor(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};

  /**
   * B"H. Semantic resurrection.
   *
   * The Awtsmoos asks compiled ops to stand up as visible form. HTML shell
   * phrases now consume their child subtrees, so the virtual renderer receives
   * the actual nested compiled DOM rather than an empty mask.
   */
  function reconstructProject(ops, pools, publicSymbols) {
    const ctx = { pools, publicSymbols, css: [], js: [], unsupported: [] };
    const htmlParts = [];
    let index = 0;
    while (index < ops.length) {
      const read = readHtmlNode(ops, index, ctx);
      if (read) { htmlParts.push(read.html); index = read.next; continue; }
      reconstructNonHtml(ops[index], ctx);
      index += 1;
    }
    const html = htmlParts.join("");
    const css = ctx.css.join("\n");
    const js = ctx.js.join("\n");
    return { html, css, js, unsupported: ctx.unsupported.slice(), proof: {
      htmlChars: html.length,
      cssChars: css.length,
      jsChars: js.length,
      unsupportedFragments: ctx.unsupported.length,
      reconstructable: true
    } };
  }

  function readHtmlNode(ops, index, ctx) {
    const op = ops[index];
    const ids = root.AwtsEctIds;
    if (!op) return null;
    if (op[0] === ids.ops.HTML_TEXT) return { html: escapeHtml(text(ctx, op[1])), next: index + 1 };
    if (op[0] !== ids.ops.PHRASE) return null;
    const name = phraseName(op[1]);
    if (name === "HTML_TREE_NODE") return readTreeNode(ops, index, ctx);
    if (name === "HTML_SHELL_CLASS_CHILDREN") return readShell(ops, index, "class", ctx);
    if (name === "HTML_SHELL_ID_CHILDREN") return readShell(ops, index, "id", ctx);
    return null;
  }

  function readTreeNode(ops, index, ctx) {
    const op = ops[index];
    const name = tag(op[2]);
    const attrCount = op[3] || 0;
    const childCount = op[4] || 0;
    let cursor = 5;
    const attrs = [];
    for (let item = 0; item < attrCount; item += 1) {
      attrs.push(attr(op[cursor]) + "=\"" + escapeAttr(publicName(ctx, op[cursor + 1])) + "\"");
      cursor += 2;
    }
    const children = readChildren(ops, index + 1, childCount, ctx);
    return { html: "<" + name + attrText(attrs) + ">" + children.html + "</" + name + ">", next: children.next };
  }

  function readShell(ops, index, attrName, ctx) {
    const op = ops[index];
    const name = tag(op[2]);
    const value = publicName(ctx, op[3]);
    const childCount = op[4] || 0;
    const children = readChildren(ops, index + 1, childCount, ctx);
    return { html: "<" + name + " " + attrName + "=\"" + escapeAttr(value) + "\">" + children.html + "</" + name + ">", next: children.next };
  }

  function readChildren(ops, index, count, ctx) {
    let next = index;
    const children = [];
    for (let child = 0; child < count; child += 1) {
      const read = readHtmlNode(ops, next, ctx);
      if (!read) { ctx.unsupported.push("html-child-missing@" + next); break; }
      children.push(read.html);
      next = read.next;
    }
    return { html: children.join(""), next };
  }

  function reconstructNonHtml(op, ctx) {
    const ids = root.AwtsEctIds;
    if (!op) return;
    if (op[0] === ids.ops.CSS_CLASS) ctx.css.push("." + publicName(ctx, op[1]) + "{/*semantic*/}");
    else if (op[0] === ids.ops.CSS_ID) ctx.css.push("#" + publicName(ctx, op[1]) + "{/*semantic*/}");
    else if (op[0] === ids.ops.CSS_TAG) ctx.css.push(tag(op[1]) + "{/*semantic*/}");
    else if (op[0] === ids.ops.CSS_ATOM) ctx.css.push("/*cssAtom:" + op[1] + "*/");
    else if (op[0] === ids.ops.CSS_ATOM_RUN) ctx.css.push("/*cssAtomRun:" + op.slice(2).join(",") + "*/");
    else if (op[0] === ids.ops.CSS_DECL) ctx.css.push("/*cssDecl:" + op.slice(1).join(",") + "*/");
    else if (op[0] === ids.ops.PHRASE) reconstructPhrase(op, ctx);
    else ctx.unsupported.push("op:" + op[0]);
  }

  function reconstructPhrase(op, ctx) {
    const name = phraseName(op[1]);
    if (name === "FETCH_JSON_ASSIGN") return reconstructFetchJsonAssign(op, ctx);
    if (name === "EVENT_ASSIGN") return reconstructEventAssign(op, ctx);
    if (name === "SELECT_CLASS_DESC_TAG") ctx.css.push("." + publicName(ctx, op[2]) + " " + tag(op[3]) + "{/*semantic*/}");
    else if (name === "CSS_ROTATE_KEYFRAMES") ctx.css.push("@keyframes awtsRotate{from{transform:rotate(" + num(op[2], ctx) + "deg)}to{transform:rotate(" + num(op[3], ctx) + "deg)}}");
    else if (name === "CSS_KEYFRAMES") ctx.css.push("@keyframes " + symbol(ctx, op[2]) + "{/*" + op[3] + " stops*/}");
    else if (name === "CSS_DECL_GROUP") ctx.css.push("/*cssGroup:" + op.slice(3).join(",") + "*/");
    else if (name === "CSS_AT_RULE") ctx.css.push("/*atRule:" + op.slice(2).join(",") + "*/");
    else if (name === "GEN_VAR_DECL") ctx.js.push(varDecl(op, 2, ctx));
    else if (name === "DECL_SLOT_FROM_PHRASE") ctx.js.push("let " + local(op[2]) + "=" + initExpr(op, 3, ctx).value + ";");
    else if (name === "DECL_CONST_FROM_CALL") ctx.js.push("const " + local(op[3]) + "=" + callExpr(op, 4, ctx).value + ";");
    else if (name === "DECL_CONST_FROM_NEW") ctx.js.push("const " + local(op[3]) + "=" + newExpr(op, 4, ctx).value + ";");
    else if (name === "DECL_OBJECT_LITERAL") ctx.js.push("const " + local(op[3]) + "=" + objectExpr(op, 4, ctx).value + ";");
    else if (name === "GEN_CALL" || name === "CALL_EXPR") ctx.js.push(callExpr(op, 2, ctx).value + ";");
    else if (name === "CALL0_EXPR") ctx.js.push(atom(op, 2, ctx).value + "();");
    else if (name === "GEN_EXPR_STMT") ctx.js.push(atom(op, 2, ctx).value + ";");
    else if (name === "GEN_RETURN") ctx.js.push("return " + atom(op, 2, ctx).value + ";");
    else if (name === "GEN_ASSIGN") binaryStmt(op, 2, ctx, true);
    else if (name === "GEN_BINARY" || name === "GEN_LOGICAL") binaryStmt(op, 2, ctx, false);
    else if (name === "GEN_UPDATE") ctx.js.push(atom(op, 4, ctx).value + (op[2] === 0 ? "++" : "--") + ";");
    else if (name === "ADD_ASSIGN") { const left = atom(op, 2, ctx); const right = atom(op, left.next, ctx); ctx.js.push(left.value + "+=" + right.value + ";"); }
    else if (name === "FUNC_SLOT") ctx.js.push("function " + local(op[2]) + "(){/*" + op[3] + " params*/}");
    else if (name.indexOf("HTML_") !== 0) ctx.unsupported.push("phrase:" + name);
  }

  function reconstructEventAssign(op, ctx) {
    const target = atom(op, 2, ctx);
    const event = atom(op, target.next, ctx);
    const left = atom(op, event.next, ctx);
    const right = atom(op, left.next, ctx);
    ctx.js.push(target.value + ".addEventListener(" + event.value + ",()=>{" + left.value + "=" + right.value + ";});");
  }

  function reconstructFetchJsonAssign(op, ctx) {
    const url = text(ctx, op[2]);
    const target = atom(op, 3, ctx);
    ctx.js.push(`fetch(${JSON.stringify(url)}).then(_$r=>_$r.json()).then(_$data=>{${target.value}.${prop(op[target.next])}=JSON.stringify(_$data);});`);
  }

  function varDecl(op, index, ctx) {
    const kind = ["const", "let", "var"][op[index]] || "let";
    const count = op[index + 1];
    let cursor = index + 2;
    const parts = [];
    for (let i = 0; i < count; i += 1) {
      const init = initExpr(op, cursor + 1, ctx);
      parts.push(local(op[cursor]) + "=" + init.value);
      cursor = init.next;
    }
    return kind + " " + parts.join(",") + ";";
  }

  function initExpr(op, index, ctx) {
    const phrase = phraseName(op[index]);
    if (phrase === "CALL_VALUE") return callExpr(op, index + 1, ctx);
    if (phrase === "NEW_VALUE") return newExpr(op, index + 1, ctx);
    if (phrase === "OBJECT_SHAPE") return objectExpr(op, index + 1, ctx);
    if (phrase === "LIT_UNDEFINED") return { value: "undefined", next: index + 1 };
    return atomBody(phraseAtomKind(phrase), op, index + 1, ctx);
  }

  function objectExpr(op, index, ctx) {
    const count = op[index];
    let cursor = index + 1;
    const props = [];
    for (let i = 0; i < count; i += 1) {
      const value = atom(op, cursor + 1, ctx);
      props.push(prop(op[cursor]) + ":" + value.value);
      cursor = value.next;
    }
    return { value: "{" + props.join(",") + "}", next: cursor };
  }

  function newExpr(op, index, ctx) {
    const count = op[index + 1];
    let cursor = index + 2;
    const args = [];
    for (let i = 0; i < count; i += 1) { const value = atom(op, cursor, ctx); args.push(value.value); cursor = value.next; }
    return { value: "new " + ctor(op[index]) + "(" + args.join(",") + ")", next: cursor };
  }

  function callExpr(op, index, ctx) {
    const count = op[index];
    let cursor = index + 1;
    const target = atom(op, cursor, ctx);
    cursor = target.next;
    const args = [];
    for (let i = 0; i < count; i += 1) { const value = atom(op, cursor, ctx); args.push(value.value); cursor = value.next; }
    return { value: target.value + "(" + args.join(",") + ")", next: cursor };
  }

  function binaryStmt(op, index, ctx, assign) {
    const left = atom(op, index + 1, ctx);
    const right = atom(op, left.next, ctx);
    ctx.js.push(left.value + (assign ? assignOp(op[index]) : binOp(op[index])) + right.value + ";");
  }

  function atom(op, index, ctx) { return atomBody(op[index], op, index + 1, ctx); }
  function atomBody(kind, op, index, ctx) {
    if (kind === 0) return { value: local(op[index]), next: index + 1 };
    if (kind === 1) return { value: String(num(op[index], ctx)), next: index + 1 };
    if (kind === 2) return { value: JSON.stringify(text(ctx, op[index])), next: index + 1 };
    if (kind === 3) return { value: op[index] ? "true" : "false", next: index + 1 };
    if (kind === 4) return { value: "null", next: index + 1 };
    if (kind === 5) return { value: host(op[index]) + "." + member(op[index + 1]), next: index + 2 };
    if (kind === 6) { const base = atom(op, index, ctx); return { value: base.value + "." + prop(op[base.next]), next: base.next + 1 }; }
    if (kind === 9) return callExpr(op, index, ctx);
    if (kind === 10) { const left = atom(op, index + 1, ctx); const right = atom(op, left.next, ctx); return { value: "(" + left.value + binOp(op[index]) + right.value + ")", next: right.next }; }
    if (kind === 11) return { value: JSON.stringify(publicName(ctx, op[index])), next: index + 1 };
    if (kind === 12) return { value: "path" + op[index], next: index + 1 };
    if (kind === 13) return { value: JSON.stringify(commonString(op[index])), next: index + 1 };
    if (kind === 14) return { value: JSON.stringify(hexColor(op[index])), next: index + 1 };
    if (kind === 15) return newExpr(op, index, ctx);
    return { value: "unknown", next: index };
  }

  function ctor(id) { const list = "Map Set WeakMap WeakSet URL Date Uint8Array Uint16Array Uint32Array Int8Array Int16Array Int32Array Float32Array Float64Array Array Object Promise RegExp Error TypeError".split(" "); return list[id] || "Ctor" + id; }
  function phraseAtomKind(name) { if (name === "LIT_NUM") return 1; if (name === "LIT_TEXT") return 2; return 0; }
  function attrText(attrs) { return attrs.length ? " " + attrs.join(" ") : ""; }
  function phraseName(id) { return root.AwtsEctIds.phrases[id] || "PHRASE"; }
  function commonString(id) { return "2d webgl webgl2 bitmaprenderer click input change pointermove pointerdown pointerup mousemove mousedown mouseup keydown keyup ready waiting done ball pulse pulse error ok".split(" ")[id] || ""; }
  function escapeHtml(value) { return String(value || "").replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch])); }
  function escapeAttr(value) { return escapeHtml(value).replace(/"/g, "&quot;"); }
  function hexColor(value) { return "#" + (value >>> 0).toString(16).padStart(6, "0").slice(-6); }
  function publicName(ctx, id) { return (ctx.publicSymbols.names && ctx.publicSymbols.names[id]) || "sym" + id; }
  function symbol(ctx, id) { return ctx.pools.sym[id] || "k" + id; }
  function text(ctx, id) { return ctx.pools.text[id] || ""; }
  function num(value, ctx) { if (value >= 128) return ctx.pools.num[value - 128] || 0; if (value >= 64) return commonNum(value - 64); return value; }
  function commonNum(id) { return "-1 -0.92 -0.5 -0.25 -0.1 -0.01 -0.004 0 0.004 0.01 0.02 0.05 0.1 0.25 0.5 0.75 0.92 1 1.5 1.6 2 2.4 2.5 3 3.14 6.28 10 12 14 16 18 24 28 32 64 72 80 90 100 180 240 320 560".split(" ")[id] || 0; }
  function local(id) { return "_$" + id; }
  function tag(id) { return root.AwtsEctIds.tags[id] || "x" + Math.abs(id); }
  function attr(id) { return root.AwtsEctIds.attrs[id] || "data-x"; }
  function host(id) { return root.AwtsEctIds.roots[id] || "host" + id; }
  function member(id) { return id < 0 ? "custom" + (-id - 1) : "m" + id; }
  function prop(id) { return id < 0 ? "p" + (-id - 1) : "p" + id; }
  function binOp(id) { return root.AwtsEctIds.binaryOps[id] || "+"; }
  function assignOp(id) { return root.AwtsEctIds.assignmentOps[id] || "="; }

  ns.reconstructProject = reconstructProject;
})(typeof self !== "undefined" ? self : globalThis);
