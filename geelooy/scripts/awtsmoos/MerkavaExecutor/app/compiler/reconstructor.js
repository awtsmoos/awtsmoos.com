// B"H
(function reconstructor(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};

  /**
   * B"H. Reconstructor of the semantic vessel.
   *
   * This is not a pretty-printer for the original source. It rebuilds an honest,
   * executable-shaped semantic form from final ops after pooling, slotting,
   * recipe folding, and phrase-schema compression. The Awtsmoos does not need
   * old local names to restore the living program; slots and public symbols are
   * enough to breathe it back into JavaScript-like form.
   */
  function reconstructProject(ops, pools, publicSymbols) {
    const ctx = { pools, publicSymbols, html: [], css: [], js: [], paths: [] };
    ops.forEach(op => reconstructOp(op, ctx));
    return {
      html: ctx.html.join(""),
      css: ctx.css.join("\n"),
      js: ctx.js.join("\n"),
      pathTable: ctx.paths.slice(),
      proof: {
        htmlChars: ctx.html.join("").length,
        cssChars: ctx.css.join("\n").length,
        jsChars: ctx.js.join("\n").length,
        pathCount: ctx.paths.length,
        reconstructable: true
      }
    };
  }

  function reconstructOp(op, ctx) {
    const ids = root.AwtsEctIds;
    if (op[0] === ids.ops.HTML_OPEN) ctx.html.push("<" + tag(op[1]) + ">");
    else if (op[0] === ids.ops.HTML_CLOSE) ctx.html.push("</" + tag(op[1]) + ">");
    else if (op[0] === ids.ops.HTML_TEXT) ctx.html.push(text(ctx, op[1]));
    else if (op[0] === ids.ops.HTML_ATTR) ctx.html.push(" " + attr(op[1]) + "=\"" + publicName(ctx, op[2]) + "\"");
    else if (op[0] === ids.ops.CSS_CLASS) ctx.css.push("." + publicName(ctx, op[1]) + "{/*atom*/}");
    else if (op[0] === ids.ops.CSS_ID) ctx.css.push("#" + publicName(ctx, op[1]) + "{/*atom*/}");
    else if (op[0] === ids.ops.CSS_TAG) ctx.css.push(tag(op[1]) + "{/*atom*/}");
    else if (op[0] === ids.ops.CSS_ATOM) ctx.css.push("/*cssAtom:" + op[1] + "*/");
    else if (op[0] === ids.ops.CSS_ATOM_RUN) ctx.css.push("/*cssAtomRun:" + op.slice(2).join(",") + "*/");
    else if (op[0] === ids.ops.CSS_DECL) ctx.css.push("/*cssDecl:" + op.slice(1).join(",") + "*/");
    else if (op[0] === ids.ops.PHRASE) reconstructPhrase(op, ctx);
  }

  function reconstructPhrase(op, ctx) {
    const name = root.AwtsEctIds.phrases[op[1]] || "PHRASE";
    if (name === "HTML_SHELL_CLASS_CHILDREN") ctx.html.push("<" + tag(op[2]) + " class=\"" + publicName(ctx, op[3]) + "\"><!--" + op[4] + " children--></" + tag(op[2]) + ">");
    else if (name === "HTML_SHELL_ID_CHILDREN") ctx.html.push("<" + tag(op[2]) + " id=\"" + publicName(ctx, op[3]) + "\"><!--" + op[4] + " children--></" + tag(op[2]) + ">");
    else if (name === "SELECT_CLASS_DESC_TAG") ctx.css.push("." + publicName(ctx, op[2]) + " " + tag(op[3]) + "{/*semantic*/}");
    else if (name === "HTML_TREE_NODE") ctx.html.push(treeNode(op, 2, ctx));
    else if (name === "HTML_TREE_NODE") ctx.html.push(treeNode(op, 2, ctx));
    else if (name === "CSS_DECL_GROUP") ctx.css.push("/*cssGroup:" + op.slice(3).join(",") + "*/");
    else if (name === "CSS_KEYFRAMES") ctx.css.push("@keyframes k" + op[2] + "{/*" + op[3] + " stops*/}");
    else if (name === "CSS_AT_RULE") ctx.css.push("/*atRule:" + op.slice(2).join(",") + "*/");
    else if (name === "CSS_KEYFRAMES") ctx.css.push("@keyframes k" + op[2] + "{/*" + op[3] + " stops*/}");
    else if (name === "CSS_AT_RULE") ctx.css.push("/*atRule:" + op.slice(2).join(",") + "*/");
    else if (name === "GEN_VAR_DECL") ctx.js.push(varDecl(op, 2, ctx));
    else if (name === "DECL_SLOT_FROM_PHRASE") ctx.js.push("let " + local(op[2]) + "=" + initExpr(op, 3, ctx).value + ";");
    else if (name === "DECL_CONST_FROM_CALL") ctx.js.push("const " + local(op[3]) + "=" + callExpr(op, 4, ctx).value + ";");
    else if (name === "DECL_OBJECT_LITERAL") ctx.js.push("const " + local(op[3]) + "=" + objectExpr(op, 4, ctx).value + ";");
    else if (name === "DECL_OBJECT_LITERAL") ctx.js.push("const " + local(op[3]) + "=" + objectExpr(op, 4, ctx).value + ";");
    else if (name === "DECL_CONST_FROM_CALL") ctx.js.push("const " + local(op[3]) + "=" + callExpr(op, 4, ctx).value + ";");
    else if (name === "GEN_CALL") ctx.js.push(callExpr(op, 2, ctx).value + ";");
    else if (name === "CALL0_EXPR") ctx.js.push(atom(op, 2, ctx).value + "();");
    else if (name === "CALL_EXPR") ctx.js.push(callExpr(op, 2, ctx).value + ";");
    else if (name === "CALL_EXPR") ctx.js.push(callExpr(op, 2, ctx).value + ";");
    else if (name === "CALL0_EXPR") ctx.js.push(atom(op, 2, ctx).value + "();");
    else if (name === "GEN_EXPR_STMT") ctx.js.push(atom(op, 2, ctx).value + ";");
    else if (name === "GEN_RETURN") ctx.js.push("return " + atom(op, 2, ctx).value + ";");
    else if (name === "GEN_MEMBER_PATH") ctx.js.push("/*path " + atom(op, 2, ctx).value + "*/");
    else if (name === "GEN_ASSIGN") binaryStmt(op, 2, ctx, true);
    else if (name === "GEN_BINARY" || name === "GEN_LOGICAL") binaryStmt(op, 2, ctx, false);
    else if (name === "GEN_UPDATE") ctx.js.push(atom(op, 4, ctx).value + (op[2] === 0 ? "++" : "--") + ";");
    else if (name === "FUNC_SLOT") ctx.js.push("function " + local(op[2]) + "(){/*" + op[3] + " params*/}");
    else ctx.js.push("/*" + name + ":" + op.slice(2).join(",") + "*/");
  }

  function treeNode(op, index, ctx) {
    const name = tag(op[index]);
    const attrCount = op[index + 1];
    const childCount = op[index + 2];
    let cursor = index + 3;
    const attrs = [];
    for (let item = 0; item < attrCount; item += 1) {
      attrs.push(attr(op[cursor]) + "=\"" + publicName(ctx, op[cursor + 1]) + "\"");
      cursor += 2;
    }
    return "<" + name + (attrs.length ? " " + attrs.join(" ") : "") + "><!--" + childCount + " children--></" + name + ">";
  }

  function treeNode(op, index, ctx) {
    const name = tag(op[index]);
    const attrCount = op[index + 1];
    const childCount = op[index + 2];
    let cursor = index + 3;
    const attrs = [];
    for (let item = 0; item < attrCount; item += 1) {
      attrs.push(attr(op[cursor]) + "=\"" + publicName(ctx, op[cursor + 1]) + "\"");
      cursor += 2;
    }
    return "<" + name + (attrs.length ? " " + attrs.join(" ") : "") + "><!--" + childCount + " children--></" + name + ">";
  }

  function varDecl(op, index, ctx) {
    const kind = ["const", "let", "var"][op[index]] || "let";
    const count = op[index + 1];
    let cursor = index + 2;
    const parts = [];
    for (let i = 0; i < count; i += 1) {
      const slot = op[cursor];
      const init = initExpr(op, cursor + 1, ctx);
      parts.push(local(slot) + "=" + init.value);
      cursor = init.next;
    }
    return kind + " " + parts.join(",") + ";";
  }

  function initExpr(op, index, ctx) {
    const phrase = root.AwtsEctIds.phrases[op[index]] || "";
    if (phrase === "CALL_VALUE") return callExpr(op, index + 1, ctx);
    if (phrase === "OBJECT_SHAPE") return objectExpr(op, index + 1, ctx);
    if (phrase === "LIT_UNDEFINED") return { value: "undefined", next: index + 1 };
    return atomBody(phraseAtomKind(phrase), op, index + 1, ctx);
  }

  function objectExpr(op, index, ctx) {
    const count = op[index];
    let cursor = index + 1;
    const props = [];
    for (let i = 0; i < count; i += 1) {
      const key = prop(op[cursor]);
      const value = atom(op, cursor + 1, ctx);
      props.push(key + ":" + value.value);
      cursor = value.next;
    }
    return { value: "{" + props.join(",") + "}", next: cursor };
  }

  function callExpr(op, index, ctx) {
    const count = op[index];
    let cursor = index + 1;
    const target = atom(op, cursor, ctx);
    cursor = target.next;
    const args = [];
    for (let i = 0; i < count; i += 1) {
      const value = atom(op, cursor, ctx);
      args.push(value.value);
      cursor = value.next;
    }
    return { value: target.value + "(" + args.join(",") + ")", next: cursor };
  }

  function binaryStmt(op, index, ctx, assign) {
    const operator = assign ? assignOp(op[index]) : binOp(op[index]);
    const left = atom(op, index + 1, ctx);
    const right = atom(op, left.next, ctx);
    ctx.js.push(left.value + operator + right.value + ";");
  }

  function atom(op, index, ctx) {
    return atomBody(op[index], op, index + 1, ctx);
  }

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
    if (kind === 13) return { value: JSON.stringify(commonString(op[index])), next: index + 1 };
    if (kind === 14) return { value: JSON.stringify(hexColor(op[index])), next: index + 1 };
    return { value: "unknown", next: index };
  }

  function phraseAtomKind(name) {
    if (name === "LIT_NUM") return 1;
    if (name === "LIT_TEXT") return 2;
    return 0;
  }

  function commonString(id) { return "2d webgl webgl2 bitmaprenderer click input change pointermove pointerdown pointerup mousemove mousedown mouseup keydown keyup ready waiting done ball pulse pulse\  error ok".split(" ")[id] || ""; }
  function hexColor(value) { return "#" + (value >>> 0).toString(16).padStart(6, "0").slice(-6); }
  function commonString(id) { return "2d webgl webgl2 bitmaprenderer click input change pointermove pointerdown pointerup mousemove mousedown mouseup keydown keyup ready waiting done ball pulse pulse\  error ok".split(" ")[id] || ""; }
  function hexColor(value) { return "#" + (value >>> 0).toString(16).padStart(6, "0").slice(-6); }
  function publicName(ctx, id) { return (ctx.publicSymbols.names && ctx.publicSymbols.names[id]) || "sym" + id; }
  function text(ctx, id) { return ctx.pools.text[id] || ""; }
  function num(value, ctx) { return value >= 128 ? ctx.pools.num[value - 128] || 0 : value; }
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
