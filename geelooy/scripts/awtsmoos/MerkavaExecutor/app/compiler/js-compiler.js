// B"H
(function jsCompiler(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};
  const COMMON_PROPS = "x y z w vx vy vz dx dy ax ay width height radius active count index length value key text textContent innerHTML fillStyle strokeStyle style clientX clientY left top right bottom pageX pageY offsetX offsetY target currentTarget set get has delete clear then catch finally json text blob arrayBuffer formData pathname href searchParams search hash protocol host hostname port method status ok headers body bodyUsed set get has delete clear then catch finally json text blob arrayBuffer formData pathname href searchParams search hash protocol host hostname port method status ok headers body bodyUsed".split(" ");
  const COMMON_STRINGS = "2d webgl webgl2 bitmaprenderer click input change pointermove pointerdown pointerup mousemove mousedown mouseup keydown keyup ready waiting done ball pulse pulse\\  error ok".split(" ");

  /**
   * B"H. Generic JavaScript semantic lowering.
   *
   * Names become slots, public symbols become shared slots, standard host calls
   * become IDs, and grammar shapes become compact phrases. Nothing here knows a
   * specific demo; it only knows JavaScript structure and browser-standard host
   * surfaces. The Awtsmoos hides old letters and leaves living form.
   */
  function parseJs(src, pools, ops, Parser, scope) {
    if (!ns.trim(src)) return;
    walk(new Parser(src).parse(), pools, ops, scope);
  }

  function walk(node, pools, ops, scope) {
    if (!node || typeof node !== "object") return;
    const active = isScope(node) ? ns.childScope(scope) : scope;
    if (phraseNode(node, pools, ops, active)) return;
    if (typeof node.type === "string" && shouldKeepAstNode(node, scope)) ops.push(astNode(node, pools));
    if (node.type === "Identifier") ops.push([root.AwtsEctIds.ops.AST_IDENT, ident(node.name, pools, active)]);
    if (node.type === "Literal") literal(node.value, pools, ops);
    Object.keys(node).forEach(key => {
      if (skipKey(key, node)) return;
      const value = node[key];
      if (Array.isArray(value)) value.forEach(child => walk(child, pools, ops, active));
      else walk(value, pools, ops, active);
    });
  }

  function phraseNode(node, pools, ops, scope) {
    const ids = root.AwtsEctIds;
    if (node.type === "VariableDeclaration") {
      const special = specialDeclaration(node, pools, scope);
      if (special) { ops.push(special); return true; }
      const decl = declarationPhrase(node, pools, scope);
      if (decl) { ops.push([ids.ops.PHRASE, phraseId("GEN_VAR_DECL")].concat(decl)); return true; }
    }
    if (node.type === "VariableDeclarator" && node.id && node.id.type === "Identifier") {
      const phrase = initPhrase(node.init, pools, scope);
      if (phrase) { ops.push([ids.ops.PHRASE, phraseId("DECL_SLOT_FROM_PHRASE"), slot(node.id.name, scope)].concat(phrase)); return true; }
    }
    if (node.type === "AssignmentExpression" && node.operator === "+=") return pushAddAssign(node, pools, ops, scope);
    if (node.type === "AssignmentExpression") return pushBinaryLike("GEN_ASSIGN", ids.assignmentOps, node.operator, node.left, node.right, pools, ops, scope);
    if (node.type === "BinaryExpression") return pushBinaryLike("GEN_BINARY", ids.binaryOps, node.operator, node.left, node.right, pools, ops, scope);
    if (node.type === "LogicalExpression") return pushBinaryLike("GEN_LOGICAL", ids.logicalOps, node.operator, node.left, node.right, pools, ops, scope);
    if (node.type === "UpdateExpression") return updatePhrase(node, pools, ops, scope);
    if (node.type === "MemberExpression") return memberPhrase(node, pools, ops, scope);
    if (node.type === "CallExpression") return callPhrase(node, pools, ops, scope);
    if (node.type === "ReturnStatement") return returnPhrase(node, pools, ops, scope);
    if (node.type === "ExpressionStatement") return expressionPhrase(node, pools, ops, scope);
    if (node.type === "FunctionDeclaration" && node.id && node.id.name) {
      ops.push([ids.ops.PHRASE, phraseId("FUNC_SLOT"), slot(node.id.name, scope), (node.params || []).length]);
      return false;
    }
    return false;
  }

  function specialDeclaration(node, pools, scope) {
    const declarations = node.declarations || [];
    if (declarations.length !== 1) return null;
    const decl = declarations[0];
    if (!decl.id || decl.id.type !== "Identifier" || !decl.init) return null;
    if (decl.init.type === "CallExpression") {
      const call = callAtom(decl.init, pools, scope);
      if (call) return [root.AwtsEctIds.ops.PHRASE, phraseId("DECL_CONST_FROM_CALL"), kindId(node.kind), slot(decl.id.name, scope)].concat(call);
    }
    if (decl.init.type === "CallExpression") {
      const call = callAtom(decl.init, pools, scope);
      if (call) return [root.AwtsEctIds.ops.PHRASE, phraseId("DECL_CONST_FROM_CALL"), kindId(node.kind), slot(decl.id.name, scope)].concat(call);
    }
    if (decl.init.type === "ObjectExpression") {
      const shape = objectShape(decl.init, pools, scope);
      if (shape) return [root.AwtsEctIds.ops.PHRASE, phraseId("DECL_OBJECT_LITERAL"), kindId(node.kind), slot(decl.id.name, scope)].concat(shape.slice(1));
    }
    if (decl.init.type === "ObjectExpression") {
      const shape = objectShape(decl.init, pools, scope);
      if (shape) return [root.AwtsEctIds.ops.PHRASE, phraseId("DECL_OBJECT_LITERAL"), kindId(node.kind), slot(decl.id.name, scope)].concat(shape.slice(1));
    }
    if (decl.init.type === "Literal" && typeof decl.init.value === "number") {
      return [root.AwtsEctIds.ops.PHRASE, phraseId("DECL_LET_NUMBER"), kindId(node.kind), slot(decl.id.name, scope), ns.smallNumOrRef(String(decl.init.value), pools)];
    }
    return null;
  }

  function declarationPhrase(node, pools, scope) {
    const declarations = node.declarations || [];
    if (!declarations.length || declarations.length > 6) return null;
    const out = [kindId(node.kind), declarations.length];
    for (let index = 0; index < declarations.length; index += 1) {
      const decl = declarations[index];
      if (!decl.id || decl.id.type !== "Identifier") return null;
      const init = initPhrase(decl.init, pools, scope);
      if (!init) return null;
      out.push(slot(decl.id.name, scope));
      init.forEach(part => out.push(part));
    }
    return out;
  }

  function expressionPhrase(node, pools, ops, scope) {
    if (node.expression && node.expression.type === "CallExpression") {
      const call = callAtom(node.expression, pools, scope);
      if (call) {
        const name = (node.expression.arguments || []).length === 0 ? "CALL0_EXPR" : "CALL_EXPR";
        ops.push([root.AwtsEctIds.ops.PHRASE, phraseId(name)].concat(call));
        return true;
      }
    }
    const value = atom(node.expression, pools, scope);
    if (!value) return false;
    ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("GEN_EXPR_STMT")].concat(value));
    return true;
  }

  function callPhrase(node, pools, ops, scope) { const call = callAtom(node, pools, scope); if (!call) return false; ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("GEN_CALL")].concat(call)); return true; }
  function memberPhrase(node, pools, ops, scope) { const path = memberAtom(node, pools, scope); if (!path) return false; ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("GEN_MEMBER_PATH")].concat(path)); return true; }
  function returnPhrase(node, pools, ops, scope) { const value = atom(node.argument, pools, scope); if (!value) return false; ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("GEN_RETURN")].concat(value)); return true; }
  function updatePhrase(node, pools, ops, scope) { const target = atom(node.argument, pools, scope); if (!target) return false; ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("GEN_UPDATE"), opId(root.AwtsEctIds.updateOps, node.operator), node.prefix ? 1 : 0].concat(target)); return true; }
  function pushAddAssign(node, pools, ops, scope) { const left = atom(node.left, pools, scope), right = atom(node.right, pools, scope); if (!left || !right) return false; ops.push([root.AwtsEctIds.ops.PHRASE, phraseId("ADD_ASSIGN")].concat(left, right)); return true; }
  function pushBinaryLike(name, table, operator, leftNode, rightNode, pools, ops, scope) { const left = atom(leftNode, pools, scope), right = atom(rightNode, pools, scope); if (!left || !right) return false; ops.push([root.AwtsEctIds.ops.PHRASE, phraseId(name), opId(table, operator)].concat(left, right)); return true; }

  function initPhrase(node, pools, scope) {
    if (!node) return [phraseId("LIT_UNDEFINED")];
    if (node.type === "Literal") return literalAtom(node.value, pools);
    if (node.type === "ObjectExpression") return objectShape(node, pools, scope);
    if (node.type === "CallExpression") { const call = callAtom(node, pools, scope); return call ? [phraseId("CALL_VALUE")].concat(call) : null; }
    return atom(node, pools, scope);
  }

  function objectShape(node, pools, scope) {
    const props = node.properties || [];
    if (!props.length || props.length > 16) return null;
    const out = [phraseId("OBJECT_SHAPE"), props.length];
    props.forEach(prop => {
      const key = prop.key && (prop.key.name || prop.key.value || "");
      const value = atom(prop.value, pools, scope) || [0, 0];
      out.push(propId(key, pools));
      value.forEach(part => out.push(part));
    });
    return out;
  }

  function callAtom(node, pools, scope) {
    const target = node.callee && node.callee.type === "MemberExpression" ? memberAtom(node.callee, pools, scope) : atom(node.callee, pools, scope);
    if (!target) return null;
    const args = node.arguments || [];
    if (args.length > 8) return null;
    const out = [args.length].concat(target);
    for (let index = 0; index < args.length; index += 1) {
      const value = atom(args[index], pools, scope);
      if (!value) return null;
      value.forEach(part => out.push(part));
    }
    return out;
  }

  function atom(node, pools, scope) {
    if (!node) return null;
    if (node.type === "Identifier") return [0, ident(node.name, pools, scope)];
    if (node.type === "Literal") return literalAtom(node.value, pools);
    if (node.type === "MemberExpression") return memberAtom(node, pools, scope);
    if (node.type === "BinaryExpression" || node.type === "LogicalExpression") return binaryAtom(node, pools, scope);
    if (node.type === "CallExpression") { const call = callAtom(node, pools, scope); return call ? [9].concat(call) : null; }
    return null;
  }

  function binaryAtom(node, pools, scope) {
    const left = atom(node.left, pools, scope), right = atom(node.right, pools, scope);
    if (!left || !right) return null;
    const table = node.type === "LogicalExpression" ? root.AwtsEctIds.logicalOps : root.AwtsEctIds.binaryOps;
    return [10, opId(table, node.operator)].concat(left, right);
  }

  function literalAtom(value, pools) {
    if (typeof value === "number") return [1, ns.smallNumOrRef(String(value), pools)];
    if (typeof value === "string" && ns.hasPublicSlot(pools.__publicSymbols || {}, value)) return [11, ns.getPublicSlot(pools.__publicSymbols, value)];
    if (typeof value === "string" && commonStringId(value) >= 0) return [13, commonStringId(value)];
    if (typeof value === "string" && colorInt(value) >= 0) return [14, colorInt(value)];
    if (typeof value === "string") return [2, ns.ref(pools.text, value)];
    if (typeof value === "boolean") return [3, value ? 1 : 0];
    if (value === null) return [4, 0];
    return null;
  }

  function memberAtom(node, pools, scope) {
    const memo = memoPath(node, pools, scope);
    if (memo.hit) return [12, memo.id];
    const host = hostMember(node);
    let encoded = null;
    if (host) encoded = [5, host.root, memberId(host.family, host.prop, pools)];
    else {
      const prop = node.property && (node.property.name || node.property.value);
      const base = node.object && node.object.type === "Identifier" ? [0, ident(node.object.name, pools, scope)] : atom(node.object, pools, scope);
      encoded = prop && base ? [6].concat(base, [propId(prop, pools)]) : null;
    }
    if (encoded) rememberPath(memo.key, scope);
    return encoded;
  }

  function memoPath(node, pools, scope) { const key = pathKey(node, pools, scope), rootMap = scope.pathRoot; return key && Object.prototype.hasOwnProperty.call(rootMap.map, key) ? { hit: true, id: rootMap.map[key], key } : { hit: false, id: -1, key }; }
  function rememberPath(key, scope) { if (!key) return; const rootMap = scope.pathRoot; if (!Object.prototype.hasOwnProperty.call(rootMap.map, key)) { rootMap.map[key] = rootMap.next; rootMap.next += 1; } }
  function pathKey(node, pools, scope) { if (!node || node.type !== "MemberExpression") return ""; const prop = node.property && (node.property.name || node.property.value || ""); if (node.object && node.object.type === "Identifier") return "L" + ident(node.object.name, pools, scope) + "." + prop; if (node.object && node.object.type === "MemberExpression") return pathKey(node.object, pools, scope) + "." + prop; return ""; }

  function hostMember(node) {
    if (!node || node.type !== "MemberExpression") return null;
    const family = rootName(node.object);
    const prop = node.property && (node.property.name || node.property.value);
    if (!prop) return null;
    const inferred = family === "element" ? inferFamily(prop) : family;
    let rootId = root.AwtsEctIds.roots.indexOf(family);
    if (rootId < 0 && family === "element") rootId = root.AwtsEctIds.roots.indexOf("Element");
    if (rootId < 0 && inferred === "ctx2d") rootId = root.AwtsEctIds.roots.indexOf("CanvasRenderingContext2D");
    if (rootId < 0) return null;
    return { root: rootId, family: inferred, prop };
  }

  function astNode(node, pools) { const list = root.AwtsEctIds.astNodes; let id = list.indexOf(node.type); if (id < 0) id = 64 + ns.ref(pools.custom, "AST:" + node.type); const packed = (meta(node) << 6) | Math.min(id, 63); return id > 63 ? [root.AwtsEctIds.ops.AST_NODE, packed, id - 64] : [root.AwtsEctIds.ops.AST_NODE, packed]; }
  function literal(value, pools, ops) { const ids = root.AwtsEctIds; if (typeof value === "number") ops.push([ids.ops.AST_NUMBER, ns.smallNumOrRef(String(value), pools)]); else if (typeof value === "string" && commonStringId(value) >= 0) ops.push([ids.ops.AST_STRING, -(commonStringId(value) + 1)]); else if (typeof value === "string") ops.push([ids.ops.AST_STRING, ns.ref(pools.text, value)]); else if (typeof value === "boolean") ops.push([ids.ops.AST_BOOL, value ? 1 : 0]); else if (value === null) ops.push([ids.ops.AST_NULL]); }
  function ident(name, pools, scope) { const rootId = root.AwtsEctIds.roots.indexOf(name); if (rootId >= 0) return -(rootId + 1); if (scope.settings.preservePublicSymbols && ns.hasPublicSlot(scope.publicSymbols, name)) return ns.getPublicSlot(scope.publicSymbols, name); return scope.settings.mangleLocalIdentifiers ? slot(name, scope) : ns.ref(pools.sym, name); }
  function slot(name, scope) { let cur = scope; while (cur) { if (Object.prototype.hasOwnProperty.call(cur.map, name)) return cur.map[name]; cur = cur.parent; } scope.map[name] = scope.next; scope.next += 1; return scope.map[name]; }
  function rootName(node) { if (!node) return ""; if (node.type === "Identifier") return root.AwtsEctIds.roots.indexOf(node.name) >= 0 ? node.name : "element"; if (node.type === "MemberExpression") return rootName(node.object); return ""; }
  function inferFamily(prop) { const members = root.AwtsEctIds.members; if ((members.ctx2d || []).indexOf(prop) >= 0) return "ctx2d"; if ((members.event || []).indexOf(prop) >= 0) return "event"; if ((members.rect || []).indexOf(prop) >= 0) return "rect"; if ((members.style || []).indexOf(prop) >= 0) return "style"; return "element"; }
  function memberId(family, prop, pools) { const list = root.AwtsEctIds.members[family] || []; const id = list.indexOf(prop); return id >= 0 ? id : propId(prop, pools); }
  function propId(name, pools) { const id = COMMON_PROPS.indexOf(String(name || "")); return id >= 0 ? id : -(ns.ref(pools.custom, "prop:" + name) + 1); }
  function commonStringId(value) { return COMMON_STRINGS.indexOf(String(value || "")); }
  function colorInt(value) { const text = String(value || ""); if (text.length !== 7 || text[0] !== "#") return -1; const n = Number.parseInt(text.slice(1), 16); return Number.isFinite(n) ? n : -1; }
  function phraseId(name) { const list = root.AwtsEctIds.phrases; let id = list.indexOf(name); if (id < 0) id = list.push(name) - 1; return id; }
  function opId(table, value) { const id = (table || []).indexOf(value); return id < 0 ? 0 : id; }
  function kindId(kind) { const id = root.AwtsEctIds.declarationKinds.indexOf(kind); return id < 0 ? 0 : id; }
  function shouldKeepAstNode(node, scope) { if (scope.settings && scope.settings.preserveExactSource) return true; return ["Program", "BlockStatement", "ExpressionStatement", "FunctionDeclaration", "Identifier", "Literal", "VariableDeclaration", "VariableDeclarator", "CallExpression", "MemberExpression", "AssignmentExpression", "BinaryExpression", "LogicalExpression", "UpdateExpression", "ObjectExpression", "Property"].indexOf(node.type) < 0; }
  function meta(node) { if (node.type === "Identifier" || node.type === "PrivateIdentifier") return 1; if (node.type === "Literal" || node.type === "TemplateElement") return 2; if (node.type === "MemberExpression" || node.type === "CallExpression" || node.type === "NewExpression") return 3; return 0; }
  function isScope(node) { return node && (node.type === "Program" || node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression" || node.type === "BlockStatement"); }
  function skipKey(key, node) { if (key === "type" || key === "start" || key === "end" || key === "loc" || key === "raw") return true; if (node && node.type === "FunctionDeclaration" && (key === "id" || key === "params")) return true; if (node && node.type === "MemberExpression" && key === "property") return true; if (node && node.type === "Property" && key === "key") return true; return key === "name" || key === "value"; }

  ns.parseJs = parseJs;
})(typeof self !== "undefined" ? self : globalThis);
