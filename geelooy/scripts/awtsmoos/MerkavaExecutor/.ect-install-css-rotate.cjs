// B"H
const fs = require("fs");

rewriteCssCompiler();
rewriteOpWriter();
rewriteReconstructor();
rewriteLoader();

function rewriteCssCompiler() {
  const path = "app/compiler/css-compiler.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.replace(
    '      const encoded = compactDeclPayload(decls);\n      stops.push({ stop: stopId(ns.trim(stop.value)), decls: encoded });',
    '      const encoded = compactDeclPayload(decls);\n      stops.push({ stop: stopId(ns.trim(stop.value)), rawDecls: decls, decls: encoded });'
  );
  text = text.replace(
    '    const out = [root.AwtsEctIds.ops.PHRASE, phraseId("CSS_KEYFRAMES"), ns.ref(pools.sym, name), stops.length];',
    '    const rotate = rotateKeyframesPhrase(name, stops);\n    if (rotate) return [rotate];\n    const out = [root.AwtsEctIds.ops.PHRASE, phraseId("CSS_KEYFRAMES"), ns.ref(pools.sym, name), stops.length];'
  );
  text = text.replace(
    '  function compactDeclPayload(decls) {',
    rotateHelperSource() + '\n\n  function compactDeclPayload(decls) {'
  );
  fs.writeFileSync(path, text);
}

function rotateHelperSource() {
  return String.raw`  /**
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

  function isEndpointStop(id) { return id === 0 || id === 1 || id === 2 || id === 6; }`;
}

function rewriteOpWriter() {
  const path = "app/compiler/op-writer.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.replace('"CSS_KEYFRAMES", "CSS_AT_RULE", "CSS_KEYFRAMES", "CSS_AT_RULE", "CALL_EXPR"', '"CSS_KEYFRAMES", "CSS_AT_RULE", "CSS_ROTATE_KEYFRAMES", "CSS_KEYFRAMES", "CSS_AT_RULE", "CALL_EXPR"');
  text = text.replace('    if (name === "CSS_KEYFRAMES") return writeCssKeyframes(writer, op, 2);', '    if (name === "CSS_ROTATE_KEYFRAMES") { writeNum(writer, op[2]); writeNum(writer, op[3]); writer.tiny(op[4]); return true; }\n    if (name === "CSS_KEYFRAMES") return writeCssKeyframes(writer, op, 2);');
  fs.writeFileSync(path, text);
}

function rewriteReconstructor() {
  const path = "app/compiler/reconstructor.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.replace(
    '    else if (name === "CSS_KEYFRAMES") ctx.css.push("@keyframes " + symbol(ctx, op[2]) + "{/*" + op[3] + " stops*/}");',
    '    else if (name === "CSS_ROTATE_KEYFRAMES") ctx.css.push("@keyframes awtsRotate{from{transform:rotate(" + num(op[2], ctx) + "deg)}to{transform:rotate(" + num(op[3], ctx) + "deg)}}");\n    else if (name === "CSS_KEYFRAMES") ctx.css.push("@keyframes " + symbol(ctx, op[2]) + "{/*" + op[3] + " stops*/}");'
  );
  text = text.replace(
    '    else if (name === "CSS_AT_RULE") ctx.css.push("/*atRule:" + op.slice(2).join(",") + "*/");',
    '    else if (name === "CSS_DECL_GROUP") ctx.css.push("/*cssGroup:" + op.slice(3).join(",") + "*/");\n    else if (name === "CSS_AT_RULE") ctx.css.push("/*atRule:" + op.slice(2).join(",") + "*/");'
  );
  fs.writeFileSync(path, text);
}

function rewriteLoader() {
  const path = "app/ect-compiler-core.js";
  let text = fs.readFileSync(path, "utf8");
  text = text.replace(/\?v=42/g, "?v=43");
  fs.writeFileSync(path, text);
}
