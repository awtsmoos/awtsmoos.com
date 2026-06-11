// B"H
const fs = require("fs");

rewriteJsCompiler();
rewriteOpWriter();
rewriteReconstructor();
rewriteLoader();

function rewriteJsCompiler() {
  const path = "app/compiler/js-compiler.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.replace(
    '    if (node.type === "ExpressionStatement") return expressionPhrase(node, pools, ops, scope);',
    '    if (node.type === "ExpressionStatement") return fetchJsonAssignPhrase(node, pools, ops, scope) || expressionPhrase(node, pools, ops, scope);'
  );
  text = text.replace(
    '  function expressionPhrase(node, pools, ops, scope) {',
    fetchPhraseSource() + '\n\n  function expressionPhrase(node, pools, ops, scope) {'
  );
  fs.writeFileSync(path, text);
}

function fetchPhraseSource() {
  return String.raw`  /**
   * B"H. Generic fetch-json-assignment chain phrase.
   *
   * This is AST-structural: fetch(url).then(r=>r.json()).then(data=>{
   * target.property = JSON.stringify(data)
   * }). It is not tied to a demo, only to the standard Promise/Fetch/JSON shape.
   */
  function fetchJsonAssignPhrase(node, pools, ops, scope) {
    const shape = fetchJsonAssignShape(node && node.expression);
    if (!shape) return false;
    const target = atom(shape.target, pools, scope);
    const prop = shape.property;
    if (!target || !prop) return false;
    ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("FETCH_JSON_ASSIGN"), ns.ref(pools.text, shape.url)].concat(target, [propId(prop, pools)]));
    return true;
  }

  function fetchJsonAssignShape(node) {
    if (!node || node.type !== "CallExpression" || !isMemberNamed(node.callee, "then") || (node.arguments || []).length !== 1) return null;
    const second = node.arguments[0];
    const firstCall = node.callee.object;
    if (!firstCall || firstCall.type !== "CallExpression" || !isMemberNamed(firstCall.callee, "then") || (firstCall.arguments || []).length !== 1) return null;
    const fetchCall = firstCall.callee.object;
    const first = firstCall.arguments[0];
    if (!isFetchCall(fetchCall) || !isJsonArrow(first) || !second || second.type !== "ArrowFunctionExpression") return null;
    const urlNode = fetchCall.arguments && fetchCall.arguments[0];
    const url = urlNode && urlNode.type === "Literal" && typeof urlNode.value === "string" ? urlNode.value : "";
    const dataName = second.params && second.params[0] && second.params[0].name;
    const assign = singleAssignment(second.body);
    if (!url || !dataName || !assign || !isJsonStringifyOf(assign.right, dataName)) return null;
    if (!assign.left || assign.left.type !== "MemberExpression") return null;
    return { url, target: assign.left.object, property: assign.left.property && (assign.left.property.name || assign.left.property.value) };
  }

  function isFetchCall(node) {
    return node && node.type === "CallExpression" && node.callee && node.callee.type === "Identifier" && node.callee.name === "fetch";
  }

  function isJsonArrow(node) {
    const param = node && node.params && node.params[0] && node.params[0].name;
    const body = node && node.body;
    return !!(param && body && body.type === "CallExpression" && isMemberNamed(body.callee, "json") && body.callee.object && body.callee.object.name === param);
  }

  function singleAssignment(body) {
    if (!body) return null;
    const stmt = body.type === "BlockStatement" && body.body && body.body.length === 1 ? body.body[0] : body;
    const expr = stmt && stmt.type === "ExpressionStatement" ? stmt.expression : stmt;
    return expr && expr.type === "AssignmentExpression" && expr.operator === "=" ? expr : null;
  }

  function isJsonStringifyOf(node, name) {
    return !!(node && node.type === "CallExpression" && isMemberNamed(node.callee, "stringify") && node.callee.object && node.callee.object.name === "JSON" && node.arguments && node.arguments[0] && node.arguments[0].name === name);
  }

  function isMemberNamed(node, name) {
    return !!(node && node.type === "MemberExpression" && node.property && (node.property.name || node.property.value) === name);
  }`;
}

function rewriteOpWriter() {
  const path = "app/compiler/op-writer.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.replace('"GEN_CALL", "GEN_EXPR_STMT", "GEN_RETURN", "GEN_MEMBER_PATH",', '"GEN_CALL", "GEN_EXPR_STMT", "GEN_RETURN", "GEN_MEMBER_PATH", "FETCH_JSON_ASSIGN",');
  text = text.replace('    if (name === "DECL_CONST_FROM_CALL") return writeDeclCallPhrase(writer, op, 2);', '    if (name === "FETCH_JSON_ASSIGN") return writeFetchJsonAssign(writer, op, 2);\n    if (name === "DECL_CONST_FROM_CALL") return writeDeclCallPhrase(writer, op, 2);');
  text = text.replace('  function writeCallPhrase(writer, op, index) { writeCallPayload(writer, op, index); return true; }', '  function writeFetchJsonAssign(writer, op, index) { writer.tiny(op[index]); const cursor = writeAtom(writer, op, index + 1); operand(writer, op[cursor]); return true; }\n  function writeCallPhrase(writer, op, index) { writeCallPayload(writer, op, index); return true; }');
  fs.writeFileSync(path, text);
}

function rewriteReconstructor() {
  const path = "app/compiler/reconstructor.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.replace(
    '    if (name === "SELECT_CLASS_DESC_TAG") ctx.css.push("." + publicName(ctx, op[2]) + " " + tag(op[3]) + "{/*semantic*/}");',
    '    if (name === "FETCH_JSON_ASSIGN") return reconstructFetchJsonAssign(op, ctx);\n    if (name === "SELECT_CLASS_DESC_TAG") ctx.css.push("." + publicName(ctx, op[2]) + " " + tag(op[3]) + "{/*semantic*/}");'
  );
  text = text.replace(
    '  function varDecl(op, index, ctx) {',
    '  function reconstructFetchJsonAssign(op, ctx) {\n    const url = text(ctx, op[2]);\n    const target = atom(op, 3, ctx);\n    ctx.js.push(`fetch(${JSON.stringify(url)}).then(_$r=>_$r.json()).then(_$data=>{${target.value}.${prop(op[target.next])}=JSON.stringify(_$data);});`);\n  }\n\n  function varDecl(op, index, ctx) {'
  );
  fs.writeFileSync(path, text);
}

function rewriteLoader() {
  const path = "app/ect-compiler-core.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.replace(/\?v=40/g, "?v=42");
  fs.writeFileSync(path, text);
}
