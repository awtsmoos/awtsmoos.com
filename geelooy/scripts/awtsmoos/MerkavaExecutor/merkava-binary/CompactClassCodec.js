// B"H
const { encodeSangArtifact } = require('./SangCodec.js');

const SYS_COMPACT_CLASS = 60;
const CC_OP = Object.freeze({
  RETURN: 0,
  SUPER_CTOR: 1,
  SET_THIS_SLOT_CONST: 2,
  GET_THIS_SLOT: 3,
  CALL_SUPER_METHOD: 4,
  ADD: 5,
  SET_DOM_TEXT_ARG: 6,
  SET_DOM_TEXT_CONST: 7,
  CONST: 8,
  END: 15
});

function methodName(node) { return node?.key?.name || String(node?.key?.value || ''); }
function propName(node) { return node?.property?.name || node?.property?.value || ''; }
function isThisProp(node) { return node?.type === 'MemberExpression' && node.object?.type === 'ThisExpression'; }
function isSuperCall(node) { return node?.type === 'CallExpression' && node.callee?.type === 'Super'; }
function isThisSet(stmt) { return stmt?.type === 'ExpressionStatement' && stmt.expression?.type === 'AssignmentExpression' && isThisProp(stmt.expression.left); }
function isDomTextSet(stmt) {
  const e = stmt?.type === 'ExpressionStatement' ? stmt.expression : stmt;
  return e?.type === 'AssignmentExpression' && e.left?.type === 'MemberExpression' && propName(e.left) === 'textContent' && e.left.object?.type === 'Identifier';
}
function literalValue(node) { return node?.type === 'Literal' ? node.value : undefined; }
function collectFields(cls) {
  const fields = [];
  for (const m of cls.body?.body || []) {
    for (const stmt of m.value?.body?.body || []) {
      if (isThisSet(stmt)) {
        const name = propName(stmt.expression.left);
        if (!fields.includes(name)) fields.push(name);
      }
    }
  }
  return fields;
}
function collectMethodNames(cls) { return (cls.body?.body || []).map(methodName); }
function writeConst(constants, value) { constants.push(value); return constants.length - 1; }
function emitVar(out, n) { n >>>= 0; while (n >= 128) { out.push((n & 127) | 128); n >>>= 7; } out.push(n); }
function compileMethod(method, fields, methods, constants) {
  const out = [];
  const params = (method.value?.params || []).map(p => p.name);
  const body = method.value?.body?.body || [];
  const fieldId = name => fields.indexOf(name);
  const methodId = name => methods.indexOf(name);
  const paramId = name => params.indexOf(name);
  for (const stmt of body) {
    if (stmt.type === 'ExpressionStatement' && isSuperCall(stmt.expression)) {
      out.push(CC_OP.SUPER_CTOR);
      continue;
    }
    if (isThisSet(stmt)) {
      const left = stmt.expression.left;
      const value = stmt.expression.right;
      out.push(CC_OP.SET_THIS_SLOT_CONST, fieldId(propName(left)) & 255);
      emitVar(out, writeConst(constants, literalValue(value)));
      continue;
    }
    if (isDomTextSet(stmt)) {
      const e = stmt.expression || stmt;
      out.push(e.right?.type === 'Identifier' ? CC_OP.SET_DOM_TEXT_ARG : CC_OP.SET_DOM_TEXT_CONST);
      emitVar(out, writeConst(constants, e.left.object.name));
      if (e.right?.type === 'Identifier') out.push(paramId(e.right.name) & 255);
      else emitVar(out, writeConst(constants, literalValue(e.right)));
      continue;
    }
    if (stmt.type === 'ReturnStatement') {
      compileReturnExpr(stmt.argument, out, fields, methods, constants);
      out.push(CC_OP.RETURN);
      continue;
    }
  }
  out.push(CC_OP.END);
  return { name: methodName(method), params, code: out };
}
function compileReturnExpr(node, out, fields, methods, constants) {
  if (!node) return;
  if (node.type === 'Literal') { out.push(CC_OP.CONST); emitVar(out, writeConst(constants, node.value)); return; }
  if (node.type === 'MemberExpression' && isThisProp(node)) { out.push(CC_OP.GET_THIS_SLOT, fields.indexOf(propName(node)) & 255); return; }
  if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression' && node.callee.object?.type === 'Super') {
    out.push(CC_OP.CALL_SUPER_METHOD); emitVar(out, writeConst(constants, propName(node.callee))); return;
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    compileReturnExpr(node.left, out, fields, methods, constants);
    compileReturnExpr(node.right, out, fields, methods, constants);
    out.push(CC_OP.ADD);
  }
}
function classNodeToCompact(cls) {
  const constants = [];
  const fields = collectFields(cls);
  const methods = collectMethodNames(cls);
  const compiled = (cls.body?.body || []).map(m => compileMethod(m, fields, methods, constants));
  return [cls.id.name, cls.superClass?.name || '', fields, compiled.map(m => [m.name, m.params, m.code]), constants];
}
function tryCompileCompactClasses(ast) {
  const classes = [];
  for (const stmt of ast.body || []) if (stmt.type === 'ClassDeclaration') classes.push(classNodeToCompact(stmt));
  if (!classes.length) return null;
  const constants = [classes];
  const bytecode = [0x13, 0x00, 0x00, 0x90, SYS_COMPACT_CLASS, 1, 0x01];
  return { constants, bytecode, meta: { kind: 'compact-class', classCount: classes.length } };
}

module.exports = { SYS_COMPACT_CLASS, CC_OP, tryCompileCompactClasses, classNodeToCompact };
