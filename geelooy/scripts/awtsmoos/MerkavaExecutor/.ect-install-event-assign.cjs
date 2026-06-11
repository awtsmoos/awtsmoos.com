// B"H
const fs = require("fs");
installJsCompiler();
installOpWriter();
installReconstructor();
installLoaderVersion();

function installJsCompiler() {
  const path = "app/compiler/js-compiler.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.split('if (node.type === "ExpressionStatement") return fetchJsonAssignPhrase(node, pools, ops, scope) || expressionPhrase(node, pools, ops, scope);').join('if (node.type === "ExpressionStatement") return eventAssignPhrase(node, pools, ops, scope) || fetchJsonAssignPhrase(node, pools, ops, scope) || expressionPhrase(node, pools, ops, scope);');
  text = insertBeforeOnce(text, '  /**\n   * B"H. Generic fetch-json-assignment chain phrase.', eventAssignSource());
  fs.writeFileSync(path, text);
  console.log("event assign js compiler bytes", Buffer.byteLength(text));
}

function eventAssignSource() {
  return `  /**\n   * B"H. Generic DOM event assignment phrase. It recognizes the structural AST\n   * shape target.addEventListener(event, ()=>{ left = right; }) for any target,\n   * any literal event name, and any atom-compatible assignment sides.\n   */\n  function eventAssignPhrase(node, pools, ops, scope) {\n    const shape = eventAssignShape(node && node.expression);\n    if (!shape) return false;\n    const target = atom(shape.target, pools, scope);\n    const event = literalAtom(shape.event, pools);\n    const left = atom(shape.left, pools, scope);\n    const right = atom(shape.right, pools, scope);\n    if (!target || !event || !left || !right) return false;\n    ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("EVENT_ASSIGN")].concat(target, event, left, right));\n    return true;\n  }\n\n  function eventAssignShape(node) {\n    if (!node || node.type !== "CallExpression" || !isMemberNamed(node.callee, "addEventListener")) return null;\n    const args = node.arguments || [];\n    if (args.length !== 2 || !args[0] || args[0].type !== "Literal" || typeof args[0].value !== "string") return null;\n    const handler = args[1];\n    if (!handler || handler.type !== "ArrowFunctionExpression") return null;\n    const assign = singleAssignment(handler.body);\n    if (!assign) return null;\n    return { target: node.callee.object, event: args[0].value, left: assign.left, right: assign.right };\n  }\n\n`;
}

function installOpWriter() {
  const path = "app/compiler/op-writer.js";
  let text = fs.readFileSync(path, "utf8");
  text = insertPhraseName(text, "EVENT_ASSIGN");
  text = insertAfterOnce(text, '    if (name === "FETCH_JSON_ASSIGN") return writeFetchJsonAssign(writer, op, 2);', '\n    if (name === "EVENT_ASSIGN") return writeManyAtoms(writer, op, 2, 4);');
  text = insertBeforeOnce(text, '  function writeDeclNewPhrase(writer, op, index) {', '  function writeManyAtoms(writer, op, index, count) { let cursor = index; for (let item = 0; item < count; item += 1) cursor = writeAtom(writer, op, cursor); return true; }\n');
  fs.writeFileSync(path, text);
  console.log("event assign op writer bytes", Buffer.byteLength(text));
}

function installReconstructor() {
  const path = "app/compiler/reconstructor.js";
  let text = fs.readFileSync(path, "utf8");
  text = insertAfterOnce(text, '    if (name === "FETCH_JSON_ASSIGN") return reconstructFetchJsonAssign(op, ctx);', '\n    if (name === "EVENT_ASSIGN") return reconstructEventAssign(op, ctx);');
  text = insertBeforeOnce(text, '  function reconstructFetchJsonAssign(op, ctx) {', '  function reconstructEventAssign(op, ctx) {\n    const target = atom(op, 2, ctx);\n    const event = atom(op, target.next, ctx);\n    const left = atom(op, event.next, ctx);\n    const right = atom(op, left.next, ctx);\n    ctx.js.push(target.value + ".addEventListener(" + event.value + ",()=>{" + left.value + "=" + right.value + ";});");\n  }\n\n');
  fs.writeFileSync(path, text);
  console.log("event assign reconstructor bytes", Buffer.byteLength(text));
}

function installLoaderVersion() {
  const path = "app/ect-compiler-core.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.split("?v=44").join("?v=45");
  fs.writeFileSync(path, text);
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
