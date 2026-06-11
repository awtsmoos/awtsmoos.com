// B"H
const fs = require("fs");

installJsCompiler();
installOpWriter();
installReconstructor();
installLoaderVersion();

function installJsCompiler() {
  const path = "app/compiler/js-compiler.js";
  let text = fs.readFileSync(path, "utf8");
  text = removeDuplicateFunctionBlock(text, "fetchJsonAssignPhrase");
  text = removeDuplicateFunctionBlock(text, "fetchJsonAssignShape");
  text = removeDuplicateFunctionBlock(text, "isFetchCall");
  text = removeDuplicateFunctionBlock(text, "isJsonArrow");
  text = removeDuplicateFunctionBlock(text, "singleAssignment");
  text = removeDuplicateFunctionBlock(text, "isJsonStringifyOf");
  text = removeDuplicateFunctionBlock(text, "isMemberNamed");
  text = insertAfterOnce(text, '  const COMMON_STRINGS = "2d webgl webgl2 bitmaprenderer click input change pointermove pointerdown pointerup mousemove mousedown mouseup keydown keyup ready waiting done ball pulse pulse\\\\  error ok".split(" ");', '\n  const COMMON_CTORS = "Map Set WeakMap WeakSet URL Date Uint8Array Uint16Array Uint32Array Int8Array Int16Array Int32Array Float32Array Float64Array Array Object Promise RegExp Error TypeError".split(" ");');
  text = insertAfterOnce(text, '    if (!decl.id || decl.id.type !== "Identifier" || !decl.init) return null;', '\n    if (decl.init.type === "NewExpression") {\n      const made = newAtom(decl.init, pools, scope);\n      if (made) return [root.AwtsEctIds.ops.PHRASE, phraseId("DECL_CONST_FROM_NEW"), kindId(node.kind), slot(decl.id.name, scope)].concat(made);\n    }');
  text = insertAfterOnce(text, '    if (node.type === "CallExpression") { const call = callAtom(node, pools, scope); return call ? [phraseId("CALL_VALUE")].concat(call) : null; }', '\n    if (node.type === "NewExpression") { const made = newAtom(node, pools, scope); return made ? [phraseId("NEW_VALUE")].concat(made) : null; }');
  text = insertAfterOnce(text, '    if (node.type === "CallExpression") { const call = callAtom(node, pools, scope); return call ? [9].concat(call) : null; }', '\n    if (node.type === "NewExpression") { const made = newAtom(node, pools, scope); return made ? [15].concat(made) : null; }');
  text = insertBeforeOnce(text, '  function callAtom(node, pools, scope) {', newAtomSource());
  text = insertBeforeOnce(text, '  function commonStringId(value) { return COMMON_STRINGS.indexOf(String(value || "")); }', '  function ctorId(name, pools) { const id = COMMON_CTORS.indexOf(String(name || "")); return id >= 0 ? id : -(ns.ref(pools.custom, "ctor:" + name) + 1); }\n');
  text = text.replace('"UpdateExpression", "ObjectExpression", "Property"].indexOf(node.type) < 0;', '"UpdateExpression", "ObjectExpression", "Property", "NewExpression"].indexOf(node.type) < 0;');
  fs.writeFileSync(path, text);
  console.log("js compiler bytes", Buffer.byteLength(text));
}

function newAtomSource() {
  return `  /**\n   * B"H. Generic constructor atom. Any new Ctor(args...) lowers by AST shape:\n   * a constructor id plus argument atoms. Standard constructors use stable ids;\n   * custom classes use the custom pool.\n   */\n  function newAtom(node, pools, scope) {\n    if (!node || node.type !== "NewExpression") return null;\n    const args = node.arguments || [];\n    if (args.length > 8) return null;\n    const name = constructorName(node.callee);\n    if (!name) return null;\n    const out = [ctorId(name, pools), args.length];\n    for (let index = 0; index < args.length; index += 1) {\n      const value = atom(args[index], pools, scope);\n      if (!value) return null;\n      value.forEach(part => out.push(part));\n    }\n    return out;\n  }\n\n  function constructorName(node) {\n    if (!node) return "";\n    if (node.type === "Identifier") return node.name || "";\n    if (node.type === "MemberExpression") {\n      const prop = node.property && (node.property.name || node.property.value || "");\n      const base = constructorName(node.object);\n      return base && prop ? base + "." + prop : prop;\n    }\n    return "";\n  }\n\n`;
}

function installOpWriter() {
  const path = "app/compiler/op-writer.js";
  let text = fs.readFileSync(path, "utf8");
  text = insertPhraseName(text, "DECL_CONST_FROM_NEW");
  text = insertAfterOnce(text, '    if (name === "FETCH_JSON_ASSIGN") return writeFetchJsonAssign(writer, op, 2);', '\n    if (name === "DECL_CONST_FROM_NEW") return writeDeclNewPhrase(writer, op, 2);');
  text = insertAfterOnce(text, '    if (name === "CALL_VALUE") return writeCallPayload(writer, op, index + 1);', '\n    if (name === "NEW_VALUE") return writeNewPayload(writer, op, index + 1);');
  text = insertAfterOnce(text, '    if (kind === 14) { writer.write(op[index], 24); return index + 1; }', '\n    if (kind === 15) return writeNewPayload(writer, op, index);');
  text = insertBeforeOnce(text, '  function writeFetchJsonAssign(writer, op, index) {', '  function writeDeclNewPhrase(writer, op, index) { writer.tiny(op[index]); writer.tiny(op[index + 1]); writeNewPayload(writer, op, index + 2); return true; }\n  function writeNewPayload(writer, op, index) { operand(writer, op[index]); const count = op[index + 1]; writer.tiny(count); let cursor = index + 2; for (let item = 0; item < count; item += 1) cursor = writeAtom(writer, op, cursor); return cursor; }\n');
  fs.writeFileSync(path, text);
  console.log("op writer bytes", Buffer.byteLength(text));
}

function installReconstructor() {
  const path = "app/compiler/reconstructor.js";
  let text = fs.readFileSync(path, "utf8");
  text = insertAfterOnce(text, '    else if (name === "DECL_CONST_FROM_CALL") ctx.js.push("const " + local(op[3]) + "=" + callExpr(op, 4, ctx).value + ";");', '\n    else if (name === "DECL_CONST_FROM_NEW") ctx.js.push("const " + local(op[3]) + "=" + newExpr(op, 4, ctx).value + ";");');
  text = insertAfterOnce(text, '    if (phrase === "CALL_VALUE") return callExpr(op, index + 1, ctx);', '\n    if (phrase === "NEW_VALUE") return newExpr(op, index + 1, ctx);');
  text = insertAfterOnce(text, '    if (kind === 14) return { value: JSON.stringify(hexColor(op[index])), next: index + 1 };', '\n    if (kind === 15) return newExpr(op, index, ctx);');
  text = insertBeforeOnce(text, '  function callExpr(op, index, ctx) {', newExprSource());
  text = insertBeforeOnce(text, '  function phraseAtomKind(name) {', '  function ctor(id) { const list = "Map Set WeakMap WeakSet URL Date Uint8Array Uint16Array Uint32Array Int8Array Int16Array Int32Array Float32Array Float64Array Array Object Promise RegExp Error TypeError".split(" "); return id < 0 ? "Ctor" + (-id - 1) : list[id] || "Ctor" + id; }\n');
  fs.writeFileSync(path, text);
  console.log("reconstructor bytes", Buffer.byteLength(text));
}

function newExprSource() {
  return `  function newExpr(op, index, ctx) {\n    const name = ctor(op[index]);\n    const count = op[index + 1];\n    let cursor = index + 2;\n    const args = [];\n    for (let i = 0; i < count; i += 1) { const value = atom(op, cursor, ctx); args.push(value.value); cursor = value.next; }\n    return { value: "new " + name + "(" + args.join(",") + ")", next: cursor };\n  }\n\n`;
}

function installLoaderVersion() {
  const path = "app/ect-compiler-core.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.split("?v=43").join("?v=44");
  fs.writeFileSync(path, text);
}

function removeDuplicateFunctionBlock(text, name) {
  const needle = "  function " + name + "(";
  const first = text.indexOf(needle);
  if (first < 0) return text;
  const second = text.indexOf(needle, first + needle.length);
  if (second < 0) return text;
  const end = functionEnd(text, second);
  return text.slice(0, second) + text.slice(end);
}

function functionEnd(text, start) {
  let index = text.indexOf("{", start);
  let depth = 0;
  let quote = "";
  while (index < text.length) {
    const ch = text[index];
    const prev = index > 0 ? text[index - 1] : "";
    if (quote) { if (ch === quote && prev !== "\\") quote = ""; }
    else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}") { depth -= 1; if (depth === 0) return index + 1; }
    index += 1;
  }
  throw new Error("function end not found for " + start);
}

function insertAfterOnce(text, needle, addition) {
  if (text.indexOf(addition.trim()) >= 0) return text;
  const at = text.indexOf(needle);
  if (at < 0) throw new Error("needle not found: " + needle.slice(0, 80));
  return text.slice(0, at + needle.length) + addition + text.slice(at + needle.length);
}

function insertBeforeOnce(text, needle, addition) {
  if (text.indexOf(addition.trim().slice(0, 80)) >= 0) return text;
  const at = text.indexOf(needle);
  if (at < 0) throw new Error("needle not found: " + needle.slice(0, 80));
  return text.slice(0, at) + addition + text.slice(at);
}

function insertPhraseName(text, name) {
  if (text.indexOf('"' + name + '"') >= 0) return text;
  const marker = '"GEN_CALL", "GEN_EXPR_STMT", "GEN_RETURN", "GEN_MEMBER_PATH"';
  const at = text.indexOf(marker);
  if (at < 0) throw new Error("phrase marker missing");
  return text.slice(0, at) + marker + ', "' + name + '"' + text.slice(at + marker.length);
}
