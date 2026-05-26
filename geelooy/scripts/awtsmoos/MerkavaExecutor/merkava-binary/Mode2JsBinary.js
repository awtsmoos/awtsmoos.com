// B"H
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');
const { BitWriter } = require('./BitWriter.js');
const { BitReader } = require('./BitReader.js');
const { MODE2_JS_OP: OP } = require('./js-md2/opcodes/Mode2OpcodeTable.js');
const { createMode2SyncPromiseClass } = require('./js-md2/runtime/Mode2AsyncRuntime.js');
const { mode2IteratorRuntime } = require('./js-md2/runtime/Mode2IteratorRuntime.js');
const { makeMode2JsArenas } = require('./js-md2/runtime/Mode2Runtime.js');
const { mode2HostBridgeRuntime } = require('./js-md2/runtime/Mode2HostBridgeRuntime.js');
const { mode2LoopExitCompiler } = require('./js-md2/compiler/Mode2StatementCompiler.js');
const { mode2ExpressionCompiler } = require('./js-md2/compiler/Mode2ExpressionCompiler.js');
const { attachMode2Frame, isMode2RuntimeError } = require('./js-md2/runtime/Mode2ErrorRuntime.js');
const { Mode2DecompilerRuntime } = require('./js-md2/runtime/Mode2DecompilerRuntime.js');
const { Mode2BytecodeValidator } = require('./js-md2/optimizer/Mode2BytecodeValidator.js');
const { mode2Optimizer } = require('./js-md2/optimizer/Mode2Optimizer.js');
const { mode2SlotCompiler } = require('./js-md2/slots/Mode2SlotCompiler.js');
const nodePath = require('path');
const nodeUrl = require('url');
const nodeFs = require('fs');
const nodeEvents = require('events');

const MAGIC = 'MD2\0';
const SECTION_JS = 0x4a;

function poolRef(pool, text) { const value = String(text || ''); let id = pool.indexOf(value); if (id < 0) { id = pool.length; pool.push(value); } return id; }
function literalRef(lits, value) { const key = JSON.stringify(value); let id = lits.findIndex(v => JSON.stringify(v) === key); if (id < 0) { id = lits.length; lits.push(value); } return id; }

function commonPrefixLength(a, b) {
  const x = String(a || ''), y = String(b || '');
  let i = 0;
  while (i < x.length && i < y.length && x.charCodeAt(i) === y.charCodeAt(i)) i++;
  return i;
}

function writeMode2PoolRaw(w, pool) {
  w.varUint(pool.length);
  for (const s of pool) w.string(s);
}

function writeMode2PoolFrontCoded(w, pool) {
  w.varUint(pool.length);
  let previous = '';
  for (const s of pool) {
    const text = String(s || '');
    const prefix = commonPrefixLength(previous, text);
    w.varUint(prefix).string(text.slice(prefix));
    previous = text;
  }
}

function measureMode2Pool(pool, mode) {
  const w = new ByteWriter();
  if (mode === 1) writeMode2PoolFrontCoded(w, pool);
  else writeMode2PoolRaw(w, pool);
  return w.toBuffer().length;
}

function chooseMode2PoolMode(pool) {
  return measureMode2Pool(pool, 1) < measureMode2Pool(pool, 0) ? 1 : 0;
}

function writeMode2Pool(w, pool, mode) {
  if (mode === 1) return writeMode2PoolFrontCoded(w, pool);
  return writeMode2PoolRaw(w, pool);
}

function readMode2Pool(r, mode) {
  const pool = [];
  if (mode === 1) {
    let previous = '';
    for (let n = r.varUint(), i = 0; i < n; i++) {
      const prefix = r.varUint();
      const text = previous.slice(0, prefix) + r.string();
      pool.push(text);
      previous = text;
    }
    return pool;
  }
  for (let n = r.varUint(), i = 0; i < n; i++) pool.push(r.string());
  return pool;
}

function writeLiteral(w, value) { if (value === undefined) return w.u8(0); if (value === null) return w.u8(1); if (value === false) return w.u8(2); if (value === true) return w.u8(3); if (Number.isInteger(value) && value >= -64 && value <= 63) return w.u8(4).varUint(value + 64); if (typeof value === 'number') return w.u8(5).string(String(value)); return w.u8(6).string(value); }
function readLiteral(r) { const kind = r.u8(); if (kind === 0) return undefined; if (kind === 1) return null; if (kind === 2) return false; if (kind === 3) return true; if (kind === 4) return r.varUint() - 64; if (kind === 5) return Number(r.string()); if (kind === 6) return r.string(); throw new Error(`Bad MD2 literal kind ${kind}`); }
async function parseJs(source) { const Parser = await require('../../MerkavaASTParser/parser-core.js'); return new Parser(source).parse(); }
function opNeedsOperand(op) { return [OP.CONST, OP.LOAD, OP.STORE, OP.DECLARE, OP.ARRAY, OP.GET_PROP, OP.MAKE_FUNCTION, OP.MAKE_FUNCTION_SNAPSHOT, OP.DECLARE_CONST, OP.INC_LOCAL, OP.CALL_METHOD_0, OP.LOAD_SLOT, OP.STORE_SLOT, OP.DECLARE_SLOT, OP.INC_SLOT, OP.JUMP_IF_FALSE, OP.JUMP, OP.SET_PROP, OP.DELETE_PROP, OP.CALL_SUPER].includes(op); }
function opNeedsTwo(op) { return op === OP.CALL_METHOD || op === OP.CALL_FUNCTION || op === OP.NEW || op === OP.CALL_METHOD_SPREAD || op === OP.CALL_FUNCTION_SPREAD || op === OP.ENTER_TRY; }
function writeOperandsForCode(code = []) {
  const operands = new ByteWriter();
  for (const ins of code) {
    const op = ins[0];
    if (opNeedsOperand(op)) operands.varUint(ins[1] || 0);
    else if (opNeedsTwo(op)) operands.varUint(ins[1] || 0).varUint(ins[2] || 0);
  }
  return operands.toBuffer();
}

function packCode4Bit(code = []) {
  const opBits = new BitWriter();
  const operands = new ByteWriter();
  for (const ins of code) {
    const op = ins[0];
    if (op > 15) { opBits.bits(OP.EXT, 4); operands.varUint(op); } else opBits.bits(op, 4);
    if (opNeedsOperand(op)) operands.varUint(ins[1] || 0);
    else if (opNeedsTwo(op)) operands.varUint(ins[1] || 0).varUint(ins[2] || 0);
  }
  return { mode: 0, count: code.length, opBytes: opBits.finish(), operandBytes: operands.toBuffer() };
}

function packCodeRaw8(code = []) {
  const ops = new ByteWriter();
  for (const ins of code) ops.u8(ins[0]);
  return { mode: 1, count: code.length, opBytes: ops.toBuffer(), operandBytes: writeOperandsForCode(code) };
}

function packCode(code = [], smart = false) {
  const four = packCode4Bit(code);
  if (!smart) return four;
  const raw = packCodeRaw8(code);
  const fourBytes = four.opBytes.length + four.operandBytes.length;
  const rawBytes = raw.opBytes.length + raw.operandBytes.length;
  return rawBytes < fourBytes ? raw : four;
}

function unpackCode(count, opBytes, operandBytes, version = 4, mode = 0) {
  const operands = new ByteReader(operandBytes), code = [];
  const bits = mode === 0 ? new BitReader(opBytes) : null;
  const opReader = mode === 1 ? new ByteReader(opBytes) : null;
  for (let i = 0; i < count; i++) {
    let op = mode === 1 ? opReader.u8() : bits.bits(4);
    if (mode === 0 && version >= 4 && op === OP.EXT) op = operands.varUint();
    if (opNeedsOperand(op)) code.push([op, operands.varUint()]);
    else if (opNeedsTwo(op)) code.push([op, operands.varUint(), operands.varUint()]);
    else code.push([op]);
  }
  return code;
}

function writePackedCode(w, code, version) {
  const packed = packCode(code, version >= 9);
  if (version >= 9) w.u8(packed.mode);
  w.varUint(packed.count).bytesWithLength(packed.opBytes).bytesWithLength(packed.operandBytes);
}

function readPackedCode(r, version) {
  const mode = version >= 9 ? r.u8() : 0;
  return unpackCode(r.varUint(), r.bytesWithLength(), r.bytesWithLength(), version, mode);
}

function collectRefs(code, pool, literals) { for (const ins of code) { if (ins[0] === OP.CONST) literalRef(literals, ins[1]); if ([OP.LOAD, OP.STORE, OP.DECLARE, OP.DECLARE_CONST, OP.INC_LOCAL, OP.CALL_METHOD_0, OP.GET_PROP, OP.CALL_METHOD, OP.CALL_METHOD_SPREAD, OP.SET_PROP, OP.DELETE_PROP, OP.ENTER_TRY].includes(ins[0]) && ins[1] != null) poolRef(pool, ins[1]); } }
function lowerAst(ast) {
  const functions = [], pool = [], literals = [];
  let emitExpr, emitStmt;
  const propName = node => node?.name || node?.value || '';
  const compileFunction = node => {
    const params = (node.params || []).map(p => p.type === 'RestElement' ? `__rest:${p.argument?.name || ''}` : (p.name || p.argument?.name || ''));
    const code = [];
    const oldExpr = emitExpr, oldStmt = emitStmt;
    [emitExpr, emitStmt] = makeEmitters(code);
    if (node.body?.type === 'BlockStatement') { for (const stmt of node.body.body || []) emitStmt(stmt); code.push([OP.CONST, undefined], [OP.RETURN]); }
    else { emitExpr(node.body); code.push([OP.RETURN]); }
    emitExpr = oldExpr; emitStmt = oldStmt;
    const id = functions.length; functions.push({ params, code, generator: !!node.generator }); return id;
  };
  const emitAssign = (code, left, right, operator) => {
    const op = { '+=': OP.ADD, '-=': OP.SUB, '*=': OP.MUL, '/=': OP.DIV, '%=': OP.MOD }[operator];
    if (left.type === 'MemberExpression') {
      const objTemp = `__md2_assign_obj_${code.length}`;
      const keyTemp = `__md2_assign_key_${code.length}`;
      const valTemp = `__md2_assign_val_${code.length}`;
      emitExpr(left.object); code.push([OP.STORE, objTemp]);
      if (left.computed) { emitExpr(left.property); code.push([OP.STORE, keyTemp]); }
      if (operator !== '=') {
        code.push([OP.LOAD, objTemp]);
        if (left.computed) code.push([OP.LOAD, keyTemp], [OP.GET_PROP_DYNAMIC]);
        else code.push([OP.GET_PROP, propName(left.property)]);
        emitExpr(right);
        if (!op) throw new Error(`MD2 unsupported member assignment ${operator}`);
        code.push([op]);
      } else emitExpr(right);
      code.push([OP.STORE, valTemp], [OP.LOAD, objTemp], [OP.LOAD, valTemp]);
      if (left.computed) code.push([OP.LOAD, keyTemp], [OP.SET_PROP_DYNAMIC]);
      else code.push([OP.SET_PROP, propName(left.property)]);
      return;
    }
    if (left.type === 'ArrayPattern') {
      const temp = `__md2_assign_arr_${code.length}`;
      emitExpr(right); code.push([OP.STORE, temp]);
      (left.elements || []).forEach((el, i) => { if (el?.type === 'Identifier') code.push([OP.LOAD, temp], [OP.GET_PROP, String(i)], [OP.STORE, el.name]); else if (el) throw new Error(`MD2 unsupported assignment array target ${el.type}`); });
      return;
    }
    if (left.type !== 'Identifier') throw new Error(`MD2 unsupported assignment target ${left.type}`);
    if (operator === '=') { emitExpr(right); code.push([OP.STORE, left.name]); return; }
    code.push([OP.LOAD, left.name]); emitExpr(right);
    if (!op) throw new Error(`MD2 unsupported assignment ${operator}`);
    code.push([op], [OP.STORE, left.name]);
  };
  const emitStmtList = (body, code) => { const list = body?.type === 'BlockStatement' ? body.body : [body]; for (const s of list || []) emitStmt(s); };
  const makeEmitters = code => {
    const e = node => {
      if (!node) return code.push([OP.CONST, undefined]);
      if (node.type === 'Literal') { if(node.regex){ code.push([OP.LOAD,'RegExp'],[OP.CONST,node.regex.pattern||''],[OP.CONST,node.regex.flags||''],[OP.NEW,0,2]); return; } return code.push([OP.CONST, node.value]); }
      if (node.type === 'TemplateLiteral') { mode2ExpressionCompiler.emitTemplateLiteral(node, code, e, OP); return; }
      if (node.type === 'Identifier') return code.push([OP.LOAD, node.name]);
      if (node.type === 'ThisExpression') return code.push([OP.LOAD, 'this']);
      if (node.type === 'Super') return code.push([OP.LOAD, 'this'], [OP.GET_PROP, '__super']);
      if (node.type === 'Super') return code.push([OP.LOAD, 'this'], [OP.GET_PROP, '__super']);
      if (node.type === 'AssignmentExpression') return emitAssign(code, node.left, node.right, node.operator);
      if (node.type === 'AwaitExpression') { e(node.argument); return code.push([OP.AWAIT]); }
      if (node.type === 'YieldExpression') { e(node.argument); return code.push([OP.YIELD]); }
      if (node.type === 'YieldExpression') { e(node.argument); return code.push([OP.YIELD]); }
      if (node.type === 'ChainExpression') { mode2ExpressionCompiler.emitChainExpression(node, e); return; }
      if (node.type === 'LogicalExpression') { if (node.operator === '&&') { e(node.left); const jf = code.push([OP.JUMP_IF_FALSE, 0]) - 1; e(node.right); code[jf][1] = code.length; return; } if (node.operator === '||') { e(node.left); const jf = code.push([OP.JUMP_IF_FALSE, 0]) - 1; const j = code.push([OP.JUMP, 0]) - 1; code[jf][1] = code.length; e(node.right); code[j][1] = code.length; return; } throw new Error(`MD2 unsupported logical ${node.operator}`); }
      if (node.type === 'BinaryExpression') { e(node.left); e(node.right); const op = { '+': OP.ADD, '-': OP.SUB, '*': OP.MUL, '/': OP.DIV, '%': OP.MOD, '>': OP.GT, '<': OP.LT, '>=': OP.GTE, '<=': OP.LTE, '==': OP.EQ, '===': OP.STRICT_EQ, '!=': OP.NEQ, '!==': OP.STRICT_NEQ, instanceof: OP.INSTANCEOF, in: OP.IN, '&&': OP.AND, '||': OP.OR, '&&': OP.AND, '||': OP.OR }[node.operator]; if (!op) throw new Error(`MD2 unsupported binary ${node.operator}`); return code.push([op]); }
      if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') return code.push([code.__md2SnapshotFunctions ? OP.MAKE_FUNCTION_SNAPSHOT : OP.MAKE_FUNCTION, compileFunction(node)]);
      if (node.type === 'ConditionalExpression') { e(node.test); const jf = code.push([OP.JUMP_IF_FALSE, 0]) - 1; e(node.consequent); const j = code.push([OP.JUMP, 0]) - 1; code[jf][1] = code.length; e(node.alternate); code[j][1] = code.length; return; }
      if (node.type === 'UnaryExpression') { if(node.operator==='delete' && node.argument?.type==='MemberExpression'){ const obj=node.argument.object; if(obj.type==='Identifier'){ code.push([OP.LOAD,obj.name]); return code.push([OP.DELETE_PROP, propName(node.argument.property)]);} e(obj); return code.push([OP.DELETE_PROP, propName(node.argument.property)]);} e(node.argument); const op = { '!': OP.NOT, '-': OP.NEG, '+': OP.POS, typeof: OP.TYPEOF, void: OP.VOID }[node.operator]; if (!op) throw new Error(`MD2 unsupported unary ${node.operator}`); return code.push([op]); }
      if (node.type === 'ArrayExpression') { for (const el of node.elements || []) e(el); return code.push([OP.ARRAY, (node.elements || []).length]); }
      if (node.type === 'ObjectExpression') { code.push([OP.OBJECT]); for (const p of node.properties || []) { if (p.type === 'SpreadElement') { e(p.argument); code.push([OP.MERGE_OBJECT]); continue; } e(p.value); if (p.computed) { e(p.key); code.push([OP.SET_PROP_DYNAMIC]); continue; } let key=(p.kind==='get'?'__get:':(p.kind==='set'?'__set:':'')) + (p.key?.type==='MemberExpression' && p.key.object?.name==='Symbol' && p.key.property?.name==='iterator' ? '__iterator' : propName(p.key)); code.push([OP.SET_PROP, key]); } return; }
      if (node.type === 'NewExpression') { e(node.callee); for (const arg of node.arguments || []) e(arg); return code.push([OP.NEW, 0, (node.arguments || []).length]); }
      if (node.type === 'MemberExpression') { e(node.object); if (node.computed) { e(node.property); return code.push([OP.GET_PROP_DYNAMIC]); } return code.push([OP.GET_PROP, propName(node.property)]); }
      if (node.type === 'CallExpression') { const onlySpread=(node.arguments||[]).length===1&&node.arguments[0].type==='SpreadElement'; if(onlySpread){ if(node.callee?.type==='Identifier'){ e(node.callee); e(node.arguments[0].argument); return code.push([OP.CALL_FUNCTION_SPREAD,0,0]); } if(node.callee?.type==='MemberExpression'){ e(node.callee.object); e(node.arguments[0].argument); return code.push([OP.CALL_METHOD_SPREAD,propName(node.callee.property),0]); } } const emitArgs = args => { let n = 0; for (const arg of args || []) { if (arg.type === 'SpreadElement' && arg.argument?.type === 'ArrayExpression') { for (const el of arg.argument.elements || []) { e(el); n++; } } else if (arg.type === 'SpreadElement') throw new Error('MD2 unsupported dynamic spread'); else { e(arg); n++; } } return n; }; if (node.callee?.type === 'Super') { code.push([OP.LOAD,'this'],[OP.LOAD,'this'],[OP.GET_PROP,'__super']); const n = emitArgs(node.arguments); return code.push([OP.CALL_SUPER, n]); } if (node.callee?.type === 'Super') { code.push([OP.LOAD,'this'],[OP.LOAD,'this'],[OP.GET_PROP,'__super']); const n = emitArgs(node.arguments); return code.push([OP.CALL_SUPER, n]); } if (node.callee?.type === 'Identifier') { e(node.callee); const n = emitArgs(node.arguments); return code.push([OP.CALL_FUNCTION, 0, n]); } if (node.callee?.type === 'MemberExpression') { if (node.callee.computed) { e(node.callee.object); e(node.callee.property); code.push([OP.GET_PROP_DYNAMIC]); const n = emitArgs(node.arguments); return code.push([OP.CALL_FUNCTION, 0, n]); } e(node.callee.object); const n = emitArgs(node.arguments); return code.push(n === 0 ? [OP.CALL_METHOD_0, propName(node.callee.property)] : [OP.CALL_METHOD, propName(node.callee.property), n]); } }
      if (node.type === 'UpdateExpression' && node.argument?.type === 'Identifier') { if (node.operator === '++') code.push([OP.INC_LOCAL, node.argument.name]); else code.push([OP.LOAD, node.argument.name], [OP.CONST, 1], [OP.SUB], [OP.STORE, node.argument.name]); return; }
      if (node.type === 'UpdateExpression' && node.argument?.type === 'MemberExpression') { const one = { type: 'Literal', value: 1 }; return emitAssign(code, node.argument, one, node.operator === '++' ? '+=' : '-='); }
      if (node.type === 'UpdateExpression' && node.argument?.type === 'MemberExpression') { const one = { type: 'Literal', value: 1 }; return emitAssign(code, node.argument, one, node.operator === '++' ? '+=' : '-='); }
      throw new Error(`MD2 unsupported expression ${node.type}`);
    };
    let s = stmt => {
      if (!stmt) return;
      if (stmt.type === 'ExportNamedDeclaration') { if(stmt.declaration) s(stmt.declaration); if(stmt.declaration?.type==='VariableDeclaration'){ for(const d of stmt.declaration.declarations||[]){ if(d.id?.name) code.push([OP.LOAD,d.id.name],[OP.STORE,'__awtsmoosResult'],[OP.LOAD,'exports'],[OP.LOAD,d.id.name],[OP.SET_PROP,d.id.name]); } } return; }
      if (stmt.type === 'ExportNamedDeclaration') { if(stmt.declaration) s(stmt.declaration); if(stmt.declaration?.type==='VariableDeclaration'){ for(const d of stmt.declaration.declarations||[]){ if(d.id?.name) code.push([OP.LOAD,d.id.name],[OP.STORE,'__awtsmoosResult'],[OP.LOAD,'exports'],[OP.LOAD,d.id.name],[OP.SET_PROP,d.id.name]); } } return; }
      if (stmt.type === 'EmptyStatement') return;
      if (stmt.type === 'EmptyStatement') return;
      if (stmt.type === 'VariableDeclaration') { for (const d of stmt.declarations) { e(d.init); if (d.id?.type === 'Identifier') code.push([stmt.kind === 'const' ? OP.DECLARE_CONST : OP.DECLARE, d.id.name]); else if (d.id?.type === 'ArrayPattern') { const temp = `__md2_destructure_${code.length}`; code.push([OP.STORE, temp]); (d.id.elements || []).forEach((el, i) => { if (!el) return; if (el.type !== 'Identifier') throw new Error(`MD2 unsupported destructuring target ${el.type}`); code.push([OP.LOAD, temp], [OP.GET_PROP, String(i)], [OP.STORE, el.name]); }); } else if (d.id?.type === 'ObjectPattern') { const temp = `__md2_obj_${code.length}`; code.push([OP.STORE,temp]); for (const p of d.id.properties || []) { const key = propName(p.key); if (p.value?.type === 'Identifier') code.push([OP.LOAD,temp],[OP.GET_PROP,key],[OP.STORE,p.value.name]); else if (p.value?.type === 'ObjectPattern' || p.value?.left?.type === 'ObjectPattern') { const inner = `__md2_obj_${code.length}_${key}`; code.push([OP.LOAD,temp],[OP.GET_PROP,key],[OP.STORE,inner]); if(p.value?.type==='AssignmentPattern'){ code.push([OP.LOAD,inner],[OP.CONST,undefined],[OP.STRICT_EQ]); const dskip=code.push([OP.JUMP_IF_FALSE,0])-1; e(p.value.right); code.push([OP.STORE,inner]); code[dskip][1]=code.length; } const pat=p.value.left||p.value; for (const q of pat.properties || []) { const qkey = propName(q.key); const target = q.value?.argument?.name || q.value?.name || q.key?.name; code.push([OP.LOAD,inner],[OP.GET_PROP,qkey],[OP.STORE,target]); if (q.value?.type === 'AssignmentPattern') { code.push([OP.LOAD,target],[OP.CONST,undefined],[OP.STRICT_EQ]); const skip = code.push([OP.JUMP_IF_FALSE,0])-1; e(q.value.right); code.push([OP.STORE,target]); code[skip][1]=code.length; } } } } } else if (d.id?.type === 'ObjectPattern') { const temp = `__md2_obj_${code.length}`; code.push([OP.STORE,temp]); for (const p of d.id.properties || []) { const key = propName(p.key); if (p.value?.type === 'Identifier') code.push([OP.LOAD,temp],[OP.GET_PROP,key],[OP.STORE,p.value.name]); else if (p.value?.type === 'ObjectPattern' || p.value?.left?.type === 'ObjectPattern') { const inner = `__md2_obj_${code.length}_${key}`; code.push([OP.LOAD,temp],[OP.GET_PROP,key],[OP.STORE,inner]); if(p.value?.type==='AssignmentPattern'){ code.push([OP.LOAD,inner],[OP.CONST,undefined],[OP.STRICT_EQ]); const dskip=code.push([OP.JUMP_IF_FALSE,0])-1; e(p.value.right); code.push([OP.STORE,inner]); code[dskip][1]=code.length; } const pat=p.value.left||p.value; for (const q of pat.properties || []) { const qkey = propName(q.key); const target = q.value?.argument?.name || q.value?.name || q.key?.name; code.push([OP.LOAD,inner],[OP.GET_PROP,qkey],[OP.STORE,target]); if (q.value?.type === 'AssignmentPattern') { code.push([OP.LOAD,target],[OP.CONST,undefined],[OP.STRICT_EQ]); const skip = code.push([OP.JUMP_IF_FALSE,0])-1; e(q.value.right); code.push([OP.STORE,target]); code[skip][1]=code.length; } } } } } else throw new Error(`MD2 unsupported variable target ${d.id?.type}`); } return; }
      if (stmt.type === 'FunctionDeclaration') { code.push([OP.MAKE_FUNCTION, compileFunction(stmt)], [OP.STORE, stmt.id.name]); return; }
      if (stmt.type === 'ClassDeclaration') { code.push([OP.OBJECT], [OP.CONST, true], [OP.SET_PROP, '__md2class']); if(stmt.superClass){ e(stmt.superClass); code.push([OP.SET_PROP,'__super']); } for (const m of stmt.body?.body || []) { if (m.type === 'PropertyDefinition') { e(m.value); code.push([OP.SET_PROP, propName(m.key)]); continue; } if (m.type !== 'MethodDefinition') continue; code.push([OP.MAKE_FUNCTION, compileFunction(m.value)], [OP.SET_PROP, propName(m.key)]); } code.push([OP.STORE, stmt.id.name]); return; }
      if (stmt.type === 'ClassDeclaration') { code.push([OP.OBJECT], [OP.CONST, true], [OP.SET_PROP, '__md2class']); if(stmt.superClass){ e(stmt.superClass); code.push([OP.SET_PROP,'__super']); } for (const m of stmt.body?.body || []) { if (m.type === 'PropertyDefinition') { e(m.value); code.push([OP.SET_PROP, propName(m.key)]); continue; } if (m.type !== 'MethodDefinition') continue; code.push([OP.MAKE_FUNCTION, compileFunction(m.value)], [OP.SET_PROP, propName(m.key)]); } code.push([OP.STORE, stmt.id.name]); return; }
      if (stmt.type === 'ReturnStatement') { e(stmt.argument); code.push([OP.RETURN]); return; }
      if (stmt.type === 'ThrowStatement') { e(stmt.argument); code.push([OP.THROW]); return; }
      if (stmt.type === 'ThrowStatement') { e(stmt.argument); code.push([OP.THROW]); return; }
      if (stmt.type === 'ExpressionStatement') { e(stmt.expression); return; }
      if (stmt.type === 'LabeledStatement') { code.__md2NextLabel = stmt.label?.name; s(stmt.body); code.__md2NextLabel = null; return; }
      if (stmt.type === 'LabeledStatement') { code.__md2NextLabel = stmt.label?.name; s(stmt.body); code.__md2NextLabel = null; return; }
      if (stmt.type === 'IfStatement') { e(stmt.test); const jf = code.push([OP.JUMP_IF_FALSE, 0]) - 1; emitStmtList(stmt.consequent, code); if (stmt.alternate) { const j = code.push([OP.JUMP, 0]) - 1; code[jf][1] = code.length; emitStmtList(stmt.alternate, code); code[j][1] = code.length; } else code[jf][1] = code.length; return; }
      if (stmt.type === 'WhileStatement') { const start = code.length; const __label=code.__md2NextLabel; code.__md2NextLabel=null; const exits=mode2LoopExitCompiler.enterLoop(code,__label); e(stmt.test); const jf = code.push([OP.JUMP_IF_FALSE, 0]) - 1; emitStmtList(stmt.body, code); code.push([OP.JUMP, start]); code[jf][1] = code.length; mode2LoopExitCompiler.patchBreaks(code, exits, code.length); mode2LoopExitCompiler.leaveLoop(code,__label); return; }
      if (stmt.type === 'DoWhileStatement') { const start = code.length; const continues=[]; code.__md2ContinueStack=(code.__md2ContinueStack||[]); code.__md2ContinueLabels=(code.__md2ContinueLabels||Object.create(null)); const __label=code.__md2NextLabel; code.__md2NextLabel=null; const exits=mode2LoopExitCompiler.enterLoop(code,__label); if(__label) code.__md2ContinueLabels[__label]=continues; code.__md2ContinueStack.push(continues); emitStmtList(stmt.body, code); for(const c of continues) code[c][1]=code.length; code.__md2ContinueStack.pop(); if(__label) delete code.__md2ContinueLabels[__label]; e(stmt.test); const jf = code.push([OP.JUMP_IF_FALSE, 0]) - 1; code.push([OP.JUMP, start]); code[jf][1] = code.length; mode2LoopExitCompiler.patchBreaks(code, exits, code.length); mode2LoopExitCompiler.leaveLoop(code,__label); return; }
      if (stmt.type === 'ContinueStatement') { const sck=code.__md2ContinueStack||[]; const cur=stmt.label?.name ? code.__md2ContinueLabels?.[stmt.label.name] : sck[sck.length-1]; if(!cur) throw new Error('MD2 continue outside loop'); cur.push(code.push([OP.JUMP,0])-1); return; }
      if (stmt.type === 'BreakStatement') { const cleanups = code.__md2BreakCleanupStack || []; const cleanup = cleanups[cleanups.length - 1]; if (cleanup) for (const ins of cleanup) code.push(ins); mode2LoopExitCompiler.emitBreak(code, stmt.label?.name); return; }
      if (stmt.type === 'DoWhileStatement') { const start = code.length; const continues=[]; code.__md2ContinueStack=(code.__md2ContinueStack||[]); code.__md2ContinueLabels=(code.__md2ContinueLabels||Object.create(null)); const __label=code.__md2NextLabel; code.__md2NextLabel=null; const exits=mode2LoopExitCompiler.enterLoop(code,__label); if(__label) code.__md2ContinueLabels[__label]=continues; code.__md2ContinueStack.push(continues); emitStmtList(stmt.body, code); for(const c of continues) code[c][1]=code.length; code.__md2ContinueStack.pop(); if(__label) delete code.__md2ContinueLabels[__label]; e(stmt.test); const jf = code.push([OP.JUMP_IF_FALSE, 0]) - 1; code.push([OP.JUMP, start]); code[jf][1] = code.length; mode2LoopExitCompiler.patchBreaks(code, exits, code.length); mode2LoopExitCompiler.leaveLoop(code,__label); return; }
      if (stmt.type === 'ContinueStatement') { const sck=code.__md2ContinueStack||[]; const cur=stmt.label?.name ? code.__md2ContinueLabels?.[stmt.label.name] : sck[sck.length-1]; if(!cur) throw new Error('MD2 continue outside loop'); cur.push(code.push([OP.JUMP,0])-1); return; }
      if (stmt.type === 'ForOfStatement') { const iter=`__md2_iter_${code.length}`, step=`__md2_step_${code.length}`; const __label=code.__md2NextLabel; code.__md2NextLabel=null; const exits=mode2LoopExitCompiler.enterLoop(code,__label); code.push([OP.LOAD,'__md2Iterator']); e(stmt.right); code.push([OP.CALL_FUNCTION,0,1],[OP.STORE,iter]); const start=code.length; code.push([OP.LOAD,iter],[OP.CALL_METHOD,'next',0],[OP.STORE,step],[OP.LOAD,step],[OP.GET_PROP,'done']); const jf=code.push([OP.JUMP_IF_FALSE,0])-1; const exitJump=code.push([OP.JUMP,0])-1; code[jf][1]=code.length; code.push([OP.LOAD,step],[OP.GET_PROP,'value']); if(stmt.left.type==='VariableDeclaration') code.push([OP.STORE,stmt.left.declarations[0].id.name]); else code.push([OP.STORE,stmt.left.name]); code.__md2BreakCleanupStack=(code.__md2BreakCleanupStack||[]); code.__md2BreakCleanupStack.push([[OP.LOAD,iter],[OP.CALL_METHOD,'return',0],[OP.POP]]); emitStmtList(stmt.body,code); code.__md2BreakCleanupStack.pop(); code.push([OP.JUMP,start]); code[exitJump][1]=code.length; mode2LoopExitCompiler.patchBreaks(code, exits, code.length); mode2LoopExitCompiler.leaveLoop(code,__label); return; }
      if (stmt.type === 'ForOfStatement') { const iter=`__md2_iter_${code.length}`, step=`__md2_step_${code.length}`; const __label=code.__md2NextLabel; code.__md2NextLabel=null; const exits=mode2LoopExitCompiler.enterLoop(code,__label); code.push([OP.LOAD,'__md2Iterator']); e(stmt.right); code.push([OP.CALL_FUNCTION,0,1],[OP.STORE,iter]); const start=code.length; code.push([OP.LOAD,iter],[OP.CALL_METHOD,'next',0],[OP.STORE,step],[OP.LOAD,step],[OP.GET_PROP,'done']); const jf=code.push([OP.JUMP_IF_FALSE,0])-1; const exitJump=code.push([OP.JUMP,0])-1; code[jf][1]=code.length; code.push([OP.LOAD,step],[OP.GET_PROP,'value']); if(stmt.left.type==='VariableDeclaration') code.push([OP.STORE,stmt.left.declarations[0].id.name]); else code.push([OP.STORE,stmt.left.name]); code.__md2BreakCleanupStack=(code.__md2BreakCleanupStack||[]); code.__md2BreakCleanupStack.push([[OP.LOAD,iter],[OP.CALL_METHOD,'return',0],[OP.POP]]); emitStmtList(stmt.body,code); code.__md2BreakCleanupStack.pop(); code.push([OP.JUMP,start]); code[exitJump][1]=code.length; mode2LoopExitCompiler.patchBreaks(code, exits, code.length); mode2LoopExitCompiler.leaveLoop(code,__label); return; }
      if (stmt.type === 'ForStatement') { if (stmt.init) { if (stmt.init.type === 'VariableDeclaration') s(stmt.init); else e(stmt.init); } const start = code.length; if (stmt.test) e(stmt.test); else code.push([OP.CONST, true]); const jf = code.push([OP.JUMP_IF_FALSE, 0]) - 1; const continues=[]; code.__md2ContinueStack=(code.__md2ContinueStack||[]); code.__md2ContinueLabels=(code.__md2ContinueLabels||Object.create(null)); const __label=code.__md2NextLabel; code.__md2NextLabel=null; const exits=mode2LoopExitCompiler.enterLoop(code,__label); if(__label) code.__md2ContinueLabels[__label]=continues; code.__md2ContinueStack.push(continues); const oldSnap=code.__md2SnapshotFunctions; code.__md2SnapshotFunctions=true; emitStmtList(stmt.body, code); code.__md2SnapshotFunctions=oldSnap; for(const c of continues) code[c][1]=code.length; code.__md2ContinueStack.pop(); if(__label) delete code.__md2ContinueLabels[__label]; if (stmt.update) e(stmt.update); code.push([OP.JUMP, start]); code[jf][1] = code.length; mode2LoopExitCompiler.patchBreaks(code, exits, code.length); mode2LoopExitCompiler.leaveLoop(code,__label); return; }
      if (stmt.type === 'SwitchStatement') { const temp = `__md2_switch_${code.length}`; e(stmt.discriminant); code.push([OP.STORE, temp]); const exits = [], nexts = []; for (const c of stmt.cases || []) { if (nexts.length) { for (const n of nexts.splice(0)) code[n][1] = code.length; } if (c.test) { code.push([OP.LOAD, temp]); e(c.test); code.push([OP.STRICT_EQ]); nexts.push(code.push([OP.JUMP_IF_FALSE, 0]) - 1); } for (const item of c.consequent || []) { if (item.type === 'BreakStatement') exits.push(code.push([OP.JUMP, 0]) - 1); else s(item); } } for (const n of nexts) code[n][1] = code.length; for (const x of exits) code[x][1] = code.length; return; }
      if (stmt.type === 'TryStatement') { const thrown=`__md2_thrown_${code.length}`; const enter=code.push([OP.ENTER_TRY, thrown, 0])-1; emitStmtList(stmt.block,code); code.push([OP.EXIT_TRY]); const after=code.push([OP.JUMP,0])-1; code[enter][2]=code.length; if(stmt.handler){ code.push([OP.LOAD,thrown],[OP.STORE,stmt.handler.param.name]); emitStmtList(stmt.handler.body,code); } code[after][1]=code.length; if(stmt.finalizer) emitStmtList(stmt.finalizer,code); return; }
      throw new Error(`MD2 unsupported statement ${stmt.type}`);
    };
    return [e, s];
  };
  const code = [];
  [emitExpr, emitStmt] = makeEmitters(code);
  for (const stmt of ast.body || []) emitStmt(stmt);
  code.push([OP.LOAD, '__awtsmoosResult'], [OP.RETURN]);
  collectRefs(code, pool, literals);
  for (const fn of functions) { for (const p of fn.params) poolRef(pool, p); collectRefs(fn.code, pool, literals); }
  return { code, functions, pool, literals };
}

function applySafeMainSlotLowering(program) {
  const stringOps = new Set([OP.LOAD, OP.STORE, OP.DECLARE, OP.INC_LOCAL]);
  const declared = [];
  const declaredSet = new Set();
  const seenDeclarations = new Set();
  const unsafe = new Set();
  for (const ins of program.code || []) {
    if (ins[0] === OP.LOAD && typeof ins[1] === 'string' && !seenDeclarations.has(ins[1])) unsafe.add(ins[1]);
    if (ins[0] === OP.DECLARE) {
      const name = ins[1];
      if (typeof name === 'string') seenDeclarations.add(name);
      if (typeof name === 'string' && !name.startsWith('__md2_') && name !== '__awtsmoosResult' && !declaredSet.has(name)) {
        declaredSet.add(name);
        declared.push(name);
      }
    }
  }
  const functionRefs = new Set();
  for (const fn of program.functions || []) {
    for (const ins of fn.code || []) {
      if (stringOps.has(ins[0]) && typeof ins[1] === 'string') functionRefs.add(ins[1]);
    }
  }
  const slotNames = declared.filter(name => !functionRefs.has(name) && !unsafe.has(name));
  const slotIds = new Map(slotNames.map((name, id) => [name, id]));
  if (!slotNames.length) {
    program.mainSlots = [];
    return program;
  }
  program.code = (program.code || []).map(ins => {
    const id = typeof ins[1] === 'string' ? slotIds.get(ins[1]) : undefined;
    if (id === undefined) return ins;
    if (ins[0] === OP.DECLARE) return [OP.DECLARE_SLOT, id];
    if (ins[0] === OP.LOAD) return [OP.LOAD_SLOT, id];
    if (ins[0] === OP.STORE) return [OP.STORE_SLOT, id];
    if (ins[0] === OP.INC_LOCAL) return [OP.INC_SLOT, id];
    return ins;
  });
  program.mainSlots = slotNames;
  return program;
}

function cloneMode2Program(program) {
  return {
    code: (program.code || []).map(ins => ins.slice()),
    functions: (program.functions || []).map(fn => ({ ...fn, params: (fn.params || []).slice(), code: (fn.code || []).map(ins => ins.slice()) })),
    pool: (program.pool || []).slice(),
    literals: (program.literals || []).slice(),
    mainSlots: (program.mainSlots || []).slice()
  };
}


function poolOperandOps() {
  return new Set([OP.LOAD, OP.STORE, OP.DECLARE, OP.DECLARE_CONST, OP.INC_LOCAL, OP.CALL_METHOD_0, OP.GET_PROP, OP.CALL_METHOD, OP.CALL_METHOD_SPREAD, OP.SET_PROP, OP.DELETE_PROP, OP.ENTER_TRY]);
}

function materializeMode2Program(program) {
  const pool = (program.pool || []).slice();
  const literals = (program.literals || []).slice();
  const code = toIds(program.code || [], pool, literals);
  const functions = (program.functions || []).map(fn => ({
    ...fn,
    params: (fn.params || []).map(p => typeof p === 'number' ? p : poolRef(pool, p)),
    code: toIds(fn.code || [], pool, literals)
  }));
  const mainSlots = (program.mainSlots || []).map(s => typeof s === 'number' ? s : poolRef(pool, s));
  return { code, functions, pool, literals, mainSlots };
}

function remapPoolRefsInCode(code, remap) {
  const poolOps = poolOperandOps();
  return (code || []).map(ins => {
    if (poolOps.has(ins[0]) && ins[1] != null) {
      const next = ins.slice();
      next[1] = remap.get(ins[1]);
      return next;
    }
    return ins.slice();
  });
}

function sortMaterializedPool(program) {
  const ordered = (program.pool || []).map((name, id) => ({ name, id })).sort((a, b) => String(a.name).localeCompare(String(b.name)) || a.id - b.id);
  const remap = new Map();
  const pool = [];
  ordered.forEach((item, nextId) => { remap.set(item.id, nextId); pool.push(item.name); });
  return {
    pool,
    literals: (program.literals || []).slice(),
    mainSlots: (program.mainSlots || []).map(id => remap.get(id)),
    code: remapPoolRefsInCode(program.code || [], remap),
    functions: (program.functions || []).map(fn => ({
      ...fn,
      params: (fn.params || []).map(id => remap.get(id)),
      code: remapPoolRefsInCode(fn.code || [], remap)
    }))
  };
}

function encodeMaterializedMode2Program(program, version = 8) {
  const w = new ByteWriter();
  w.raw(Buffer.from(MAGIC, 'binary')).u8(SECTION_JS).u8(version);
  const poolMode = version >= 7 ? chooseMode2PoolMode(program.pool) : 0;
  if (version >= 7) w.u8(poolMode);
  writeMode2Pool(w, program.pool, poolMode);
  w.varUint(program.literals.length); for (const v of program.literals) writeLiteral(w, v);
  if (version >= 6) { w.varUint((program.mainSlots || []).length); for (const id of (program.mainSlots || [])) w.varUint(id); }
  w.varUint(program.functions.length);
  for (const fn of program.functions) { w.u8(fn.generator ? 1 : 0); w.varUint(fn.params.length); for (const id of fn.params) w.varUint(id); writePackedCode(w, fn.code, version); }
  writePackedCode(w, program.code, version);
  return w.toBuffer();
}

function encodeSortedPoolMode2Program(program) {
  return encodeMaterializedMode2Program(sortMaterializedPool(materializeMode2Program(program)), 9);
}

function encodeMode2Program(program, version = 6) {
  const w = new ByteWriter();
  w.raw(Buffer.from(MAGIC, 'binary')).u8(SECTION_JS).u8(version);
  const poolMode = version >= 7 ? chooseMode2PoolMode(program.pool) : 0;
  if (version >= 7) w.u8(poolMode);
  writeMode2Pool(w, program.pool, poolMode);
  w.varUint(program.literals.length); for (const v of program.literals) writeLiteral(w, v);
  if (version >= 6) { w.varUint((program.mainSlots || []).length); for (const s of (program.mainSlots || [])) w.varUint(poolRef(program.pool, s)); }
  w.varUint(program.functions.length);
  for (const fn of program.functions) { w.u8(fn.generator ? 1 : 0); w.varUint(fn.params.length); for (const p of fn.params) w.varUint(poolRef(program.pool, p)); writePackedCode(w, toIds(fn.code, program.pool, program.literals), version); }
  writePackedCode(w, toIds(program.code, program.pool, program.literals), version);
  return w.toBuffer();
}

async function encodeMode2JsBinary(source) {
  const ast = typeof source === 'string' ? await parseJs(source) : source;
  const base = lowerAst(ast);
  const plain = cloneMode2Program(base);
  plain.mainSlots = [];
  const slotted = applySafeMainSlotLowering(cloneMode2Program(base));
  const candidates = [encodeMode2Program(plain, 5), encodeMode2Program(plain, 7), encodeMode2Program(plain, 9), encodeSortedPoolMode2Program(plain), encodeMode2Program(slotted, 6), encodeMode2Program(slotted, 7), encodeMode2Program(slotted, 9), encodeSortedPoolMode2Program(slotted)];
  return candidates.reduce((best, next) => next.length < best.length ? next : best, candidates[0]);
}
function toIds(code, pool, literals) { return code.map(ins => { const op = ins[0]; if (op === OP.CONST) return [op, literalRef(literals, ins[1])]; if ([OP.LOAD, OP.STORE, OP.DECLARE, OP.DECLARE_CONST, OP.INC_LOCAL, OP.CALL_METHOD_0, OP.GET_PROP, OP.CALL_METHOD, OP.CALL_METHOD_SPREAD, OP.SET_PROP, OP.DELETE_PROP, OP.ENTER_TRY].includes(op)) return [op, poolRef(pool, ins[1]), ins[2]]; return ins; }); }
function decodeMode2JsBinary(buffer) {
  const r = new ByteReader(buffer), magic = r.bytes(4).toString('binary'); if (magic !== MAGIC) throw new Error(`Bad MD2 magic ${magic}`); const section = r.u8(); if (section !== SECTION_JS) throw new Error(`Bad MD2 section for JS: ${section}`); const version = r.u8();
  const poolMode = version >= 7 ? r.u8() : 0;
  const pool = readMode2Pool(r, poolMode);
  const literals = []; for (let n = r.varUint(), i = 0; i < n; i++) literals.push(readLiteral(r));
  const mainSlots = []; if (version >= 6) for (let n = r.varUint(), i = 0; i < n; i++) mainSlots.push(r.varUint());
  const functions = [];
  if (version >= 3) for (let n = r.varUint(), i = 0; i < n; i++) { const generator = version >= 5 ? !!r.u8() : false; const params = []; for (let p = r.varUint(), j = 0; j < p; j++) params.push(r.varUint()); functions.push({ params, generator, code: readPackedCode(r, version) }); }
  const code = version >= 2 ? readPackedCode(r, version) : legacyReadCode(r);
  return { version, pool, literals, mainSlots, functions, code };
}
function legacyReadCode(r) { const code = []; for (let n = r.varUint(), i = 0; i < n; i++) { const op = r.u8(); if (opNeedsOperand(op)) code.push([op, r.varUint()]); else if (opNeedsTwo(op)) code.push([op, r.varUint(), r.varUint()]); else code.push([op]); } return code; }

function createMode2NodeRuntime(options = {}) {
  const cwd = options.cwd || (typeof process !== 'undefined' ? process.cwd() : '.');
  const argv = options.argv || (typeof process !== 'undefined' ? process.argv : []);
  const safeFs = {
    existsSync(path) { return nodeFs.existsSync(nodePath.resolve(cwd, String(path))); },
    readFileSync(path, encoding) { return nodeFs.readFileSync(nodePath.resolve(cwd, String(path)), encoding); },
    statSync(path) { return nodeFs.statSync(nodePath.resolve(cwd, String(path))); }
  };
  const processShim = Object.assign(Object.create(null), {
    argv,
    env: Object.assign(Object.create(null), (typeof process !== 'undefined' ? process.env : {})),
    cwd() { return cwd; },
    nextTick(fn, ...args) { if (typeof fn === 'function') fn(...args); }
  });
  const builtins = Object.assign(Object.create(null), {
    path: nodePath.posix || nodePath,
    url: nodeUrl,
    fs: safeFs,
    events: nodeEvents,
    buffer: { Buffer },
    util: require('util'),
    os: require('os')
  });
  const req = spec => {
    if (builtins[spec]) return builtins[spec];
    throw new Error(`MD2 Node require unsupported ${spec}`);
  };
  const setImmediateShim = (fn, ...args) => { if (typeof fn === 'function') fn(...args); return 1; };
  const queueMicrotaskShim = fn => { if (typeof fn === 'function') fn(); };
  return { require: req, process: processShim, Buffer, URL, console, setTimeout, clearTimeout, setImmediate: setImmediateShim, queueMicrotask: queueMicrotaskShim };
}

function runMode2JsBinary(buffer, options = {}) {
  const program = decodeMode2JsBinary(buffer), globals = Object.assign({}, (options.nodeRuntime || options.nodeCompat) ? createMode2NodeRuntime(options) : {}, options.globals || {}), rootScope = Object.create(null); Object.assign(rootScope, globals); rootScope.__md2Slots = new Array((program.mainSlots || []).length); rootScope.__md2Slots = new Array((program.mainSlots || []).length);
  const makeScope = (parent, params = [], args = [], thisArg) => { const scope = Object.create(parent || null); scope.this = thisArg; params.forEach((pid, i) => { const name = program.pool[pid]; if (name.startsWith('__rest:')) scope[name.slice(7)] = args.slice(i); else scope[name] = args[i]; }); return scope; };
  const makeFunction = (id, scope) => ({ __md2fn: true, id, params: program.functions[id].params, code: program.functions[id].code, generator: !!program.functions[id].generator, env: scope });
  const callMd2 = (fn, args = [], thisArg) => {
    const scope = makeScope(fn.env || rootScope, fn.params, args, thisArg);
    if (fn.generator) {
      const state = { ip: 0, stack: [], done: false };
      const it = {
        next(input) {
          if (state.done) return { value: undefined, done: true };
          if (state.ip > 0) state.stack.push(input);
          const out = runCode(fn.code, scope, state);
          if (out?.__md2yield) return { value: out.value, done: false };
          state.done = true;
          return { value: out, done: true };
        },
        return(value) {
          state.done = true;
          return { value, done: true };
        },
        throw(error) {
          if (state.done) throw error;
          const afterJumpIndex = fn.code.findIndex((ins, index) => index >= state.ip && ins[0] === OP.JUMP && ins[1] > index);
          if (afterJumpIndex < 0) { state.done = true; throw error; }
          const thrownName = Object.keys(scope).find(name => name.startsWith('__md2_thrown_')) || '__md2_thrown_0';
          scope[thrownName] = error;
          state.ip = afterJumpIndex + 1;
          state.stack = [];
          const out = runCode(fn.code, scope, state);
          if (out?.__md2yield) return { value: out.value, done: false };
          state.done = true;
          return { value: out, done: true };
        }
      };
      if (typeof Symbol !== 'undefined') it[Symbol.iterator] = function iteratorSelf() { return this; };
      return it;
    }
    try { return runCode(fn.code, scope); }
    catch (err) { throw attachMode2Frame(err, { functionId: fn.id, ip: null, opName: 'CALL_FRAME' }); }
  };
  const Md2SyncPromise = createMode2SyncPromiseClass(callMd2);
  const wrapHostCallback = value => mode2HostBridgeRuntime.wrapCallback(value, callMd2);
  const wrapHostArgs = args => mode2HostBridgeRuntime.wrapArgs(args, callMd2);
  const timerQueue = [];
  const md2SetTimeout = (fn, delay, ...args) => { timerQueue.push({ fn, args }); const id = timerQueue.length; flushTimers(); return id; };
  const flushTimers = () => { while (timerQueue.length) { const task = timerQueue.shift(); if (task.fn?.__md2fn) callMd2(task.fn, task.args); else if (typeof task.fn === 'function') task.fn(...task.args); } };
  const md2Gen = values => mode2IteratorRuntime.createGenerator(values);
  const md2ToArray = value => mode2IteratorRuntime.toArray(value, callMd2);
  const md2Iterator = value => mode2IteratorRuntime.createIterator(value, callMd2);
  const declaredNames = new Set();
  const scanDeclared = code => { for (const ins of code || []) if (ins[0] === OP.DECLARE || ins[0] === OP.DECLARE_CONST) declaredNames.add(program.pool[ins[1]]); };
  scanDeclared(program.code); for (const fn of program.functions || []) scanDeclared(fn.code);
  const read = (scope, name) => name === 'Promise' ? Md2SyncPromise : (name === 'setTimeout' ? md2SetTimeout : (name in scope ? scope[name] : (name === '__md2Gen' ? md2Gen : (name === '__md2ToArray' ? md2ToArray : (name === '__md2Iterator' ? md2Iterator : (declaredNames.has(name) ? (() => { throw new ReferenceError(`Cannot access '${name}' before initialization`); })() : globalThis[name]))))));
  const runCode = (code, scope, state) => { const stack = state?.stack || [], pop = () => stack.pop(); for (let ip = state?.ip || 0; ip < code.length; ip++) { if (state) { state.ip = ip; state.stack = stack; } const ins = code[ip], op = ins[0];
    if (op === OP.CONST) stack.push(program.literals[ins[1]]);
    else if (op === OP.LOAD) { try { stack.push(read(scope, program.pool[ins[1]])); } catch (err) { const ownTry = Object.prototype.hasOwnProperty.call(scope, '__md2TryStack') ? scope.__md2TryStack : null, frame = ownTry?.pop(); if (frame) { scope[frame.thrown] = err; ip = frame.catchPc - 1; } else throw err; } }
    else if (op === OP.DECLARE) scope[program.pool[ins[1]]] = pop();
    else if (op === OP.DECLARE_CONST) { scope[program.pool[ins[1]]] = pop(); scope.__md2Const = scope.__md2Const || Object.create(null); scope.__md2Const[program.pool[ins[1]]] = true; }
    else if (op === OP.DECLARE_SLOT) { scope.__md2Slots[ins[1]] = pop(); }
    else if (op === OP.LOAD_SLOT) { stack.push(scope.__md2Slots[ins[1]]); }
    else if (op === OP.STORE_SLOT) { scope.__md2Slots[ins[1]] = pop(); }
    else if (op === OP.INC_SLOT) { scope.__md2Slots[ins[1]] = (scope.__md2Slots[ins[1]] || 0) + 1; }
    else if (op === OP.STORE) { const name = program.pool[ins[1]], value = pop(); let target = scope; while (target && !Object.prototype.hasOwnProperty.call(target, name)) target = Object.getPrototypeOf(target); target = target || scope; if (target.__md2Const?.[name]) { const err = new TypeError(`Assignment to constant variable ${name}`), ownTry = Object.prototype.hasOwnProperty.call(scope, '__md2TryStack') ? scope.__md2TryStack : null, frame = ownTry?.pop(); if (frame) { scope[frame.thrown] = err; ip = frame.catchPc - 1; } else throw err; } else target[name] = value; }
    else if (op === OP.INC_LOCAL) { const name = program.pool[ins[1]]; let target = scope; while (target && !Object.prototype.hasOwnProperty.call(target, name)) target = Object.getPrototypeOf(target); target = target || scope; if (target.__md2Const?.[name]) throw new TypeError(`Assignment to constant variable ${name}`); target[name] = (target[name] || 0) + 1; }
    else if (op === OP.MAKE_FUNCTION) stack.push(makeFunction(ins[1], scope));
    else if (op === OP.MAKE_FUNCTION_SNAPSHOT) { const snap = Object.assign(Object.create(Object.getPrototypeOf(scope)), scope); stack.push(makeFunction(ins[1], snap)); }
    else if (op === OP.MAKE_FUNCTION_SNAPSHOT) { const snap = Object.assign(Object.create(Object.getPrototypeOf(scope)), scope); stack.push(makeFunction(ins[1], snap)); }
    else if (op === OP.ADD) { const b = pop(), a = pop(); stack.push(a + b); }
    else if (op === OP.SUB) { const b = pop(), a = pop(); stack.push(a - b); }
    else if (op === OP.MUL) { const b = pop(), a = pop(); stack.push(a * b); }
    else if (op === OP.DIV) { const b = pop(), a = pop(); stack.push(a / b); }
    else if (op === OP.MOD) { const b = pop(), a = pop(); stack.push(a % b); }
    else if (op === OP.GT) { const b = pop(), a = pop(); stack.push(a > b); }
    else if (op === OP.LT) { const b = pop(), a = pop(); stack.push(a < b); }
    else if (op === OP.GTE) { const b = pop(), a = pop(); stack.push(a >= b); }
    else if (op === OP.LTE) { const b = pop(), a = pop(); stack.push(a <= b); }
    else if (op === OP.EQ) { const b = pop(), a = pop(); stack.push(a == b); }
    else if (op === OP.STRICT_EQ) { const b = pop(), a = pop(); stack.push(a === b); }
    else if (op === OP.NEQ) { const b = pop(), a = pop(); stack.push(a != b); }
    else if (op === OP.STRICT_NEQ) { const b = pop(), a = pop(); stack.push(a !== b); }
    else if (op === OP.ENTER_TRY) { scope.__md2TryStack = scope.__md2TryStack || []; scope.__md2TryStack.push({ thrown: program.pool[ins[1]], catchPc: ins[2] }); }
    else if (op === OP.EXIT_TRY) { if (scope.__md2TryStack) scope.__md2TryStack.pop(); }
    else if (op === OP.ENTER_TRY) { scope.__md2TryStack = scope.__md2TryStack || []; scope.__md2TryStack.push({ thrown: program.pool[ins[1]], catchPc: ins[2] }); }
    else if (op === OP.EXIT_TRY) { if (scope.__md2TryStack) scope.__md2TryStack.pop(); }
    else if (op === OP.AWAIT) { const value = pop(); stack.push(value?.__md2promise !== undefined ? value.__md2promise : value); }
    else if (op === OP.YIELD) { const value = pop(); if (state) { state.ip = ip + 1; state.stack = stack; } return { __md2yield: true, value }; }
    else if (op === OP.YIELD) { const value = pop(); if (state) { state.ip = ip + 1; state.stack = stack; } return { __md2yield: true, value }; }
    else if (op === OP.THROW) { const err = pop(), ownTry = Object.prototype.hasOwnProperty.call(scope, '__md2TryStack') ? scope.__md2TryStack : null, frame = ownTry?.pop(); if (frame) { scope[frame.thrown] = err; ip = frame.catchPc - 1; } else throw err; }
    else if (op === OP.THROW) { const err = pop(), ownTry = Object.prototype.hasOwnProperty.call(scope, '__md2TryStack') ? scope.__md2TryStack : null, frame = ownTry?.pop(); if (frame) { scope[frame.thrown] = err; ip = frame.catchPc - 1; } else throw err; }
    else if (op === OP.INSTANCEOF) { const b = pop(), a = pop(); stack.push(typeof b === 'function' ? a instanceof b : false); }
    else if (op === OP.NOT) stack.push(!pop());
    else if (op === OP.NEG) stack.push(-pop());
    else if (op === OP.POS) stack.push(+pop());
    else if (op === OP.TYPEOF) stack.push(typeof pop());
    else if (op === OP.VOID) { pop(); stack.push(undefined); }
    else if (op === OP.DELETE_PROP) { const obj=pop(); const ok=obj?delete obj[program.pool[ins[1]]]:true; stack.push(ok); }
    else if (op === OP.IN) { const b=pop(), a=pop(); stack.push(a in Object(b)); }
    else if (op === OP.DELETE_PROP) { const obj=pop(); const ok=obj?delete obj[program.pool[ins[1]]]:true; stack.push(ok); }
    else if (op === OP.IN) { const b=pop(), a=pop(); stack.push(a in Object(b)); }
    else if (op === OP.NEG) stack.push(-pop());
    else if (op === OP.POS) stack.push(+pop());
    else if (op === OP.TYPEOF) stack.push(typeof pop());
    else if (op === OP.VOID) { pop(); stack.push(undefined); }
    else if (op === OP.DELETE_PROP) { const obj=pop(); const ok=obj?delete obj[program.pool[ins[1]]]:true; stack.push(ok); }
    else if (op === OP.IN) { const b=pop(), a=pop(); stack.push(a in Object(b)); }
    else if (op === OP.DELETE_PROP) { const obj=pop(); const ok=obj?delete obj[program.pool[ins[1]]]:true; stack.push(ok); }
    else if (op === OP.IN) { const b=pop(), a=pop(); stack.push(a in Object(b)); }
    else if (op === OP.AND) { const b = pop(), a = pop(); stack.push(a && b); }
    else if (op === OP.OR) { const b = pop(), a = pop(); stack.push(a || b); }
    else if (op === OP.ARRAY) { const n = ins[1], items = stack.splice(stack.length - n, n); stack.push(items); }
    else if (op === OP.OBJECT) stack.push({});
    else if (op === OP.SET_PROP) { const value = pop(), obj = stack.at(-1), key = program.pool[ins[1]], setter = obj?.['__set:' + key]; if (setter?.__md2fn) callMd2(setter, [value], obj); else if (typeof setter === 'function') setter.call(obj, value); else if (obj != null) obj[key] = value; }
    else if (op === OP.SET_PROP_DYNAMIC) { const key = pop(), value = pop(), obj = stack.at(-1), hookKey = typeof key === 'symbol' ? null : String(key), setter = hookKey == null ? undefined : obj?.['__set:' + hookKey]; if (setter?.__md2fn) callMd2(setter, [value], obj); else if (typeof setter === 'function') setter.call(obj, value); else if (obj != null) obj[key] = value; }
    else if (op === OP.SET_PROP_DYNAMIC) { const key = pop(), value = pop(), obj = stack.at(-1), hookKey = typeof key === 'symbol' ? null : String(key), setter = hookKey == null ? undefined : obj?.['__set:' + hookKey]; if (setter?.__md2fn) callMd2(setter, [value], obj); else if (typeof setter === 'function') setter.call(obj, value); else if (obj != null) obj[key] = value; }
    else if (op === OP.MERGE_OBJECT) { const src = pop(), obj = stack.at(-1); if (obj != null && src != null) Object.assign(obj, src); }
    else if (op === OP.GET_PROP) { const obj = pop(), key = program.pool[ins[1]], getter = obj?.['__get:' + key]; stack.push(getter?.__md2fn ? callMd2(getter, [], obj) : (obj == null ? undefined : obj[key])); }
    else if (op === OP.GET_PROP_DYNAMIC) { const key = pop(), obj = pop(), hookKey = typeof key === 'symbol' ? null : String(key), getter = hookKey == null ? undefined : obj?.['__get:' + hookKey]; stack.push(getter?.__md2fn ? callMd2(getter, [], obj) : (obj == null ? undefined : obj[key])); }
    else if (op === OP.GET_PROP_DYNAMIC) { const key = pop(), obj = pop(), hookKey = typeof key === 'symbol' ? null : String(key), getter = hookKey == null ? undefined : obj?.['__get:' + hookKey]; stack.push(getter?.__md2fn ? callMd2(getter, [], obj) : (obj == null ? undefined : obj[key])); }
    else if (op === OP.CALL_FUNCTION) { const argc = ins[2], args = stack.splice(stack.length - argc, argc), fn = pop(); try { stack.push(fn?.__md2fn ? callMd2(fn, args) : (typeof fn === 'function' ? fn(...wrapHostArgs(args)) : undefined)); } catch(err) { const frame = scope.__md2TryStack?.pop(); if(frame){ scope[frame.thrown]=err; ip=frame.catchPc-1; } else throw err; } }
    else if (op === OP.CALL_SUPER) { const argc = ins[1], args = stack.splice(stack.length - argc, argc), superClass = pop(), thisArg = pop(), init = superClass?.constructor; if (init?.__md2fn) callMd2(init, args, thisArg); else if (typeof init === 'function' && init !== Object.prototype.constructor) init.apply(thisArg, args); stack.push(thisArg); }
    else if (op === OP.CALL_SUPER) { const argc = ins[1], args = stack.splice(stack.length - argc, argc), superClass = pop(), thisArg = pop(), init = superClass?.constructor; if (init?.__md2fn) callMd2(init, args, thisArg); else if (typeof init === 'function' && init !== Object.prototype.constructor) init.apply(thisArg, args); stack.push(thisArg); }
    else if (op === OP.NEW) { const argc = ins[2], args = stack.splice(stack.length - argc, argc), Ctor = pop(); if (Ctor?.__md2class) { const inst = Object.create(Ctor); const init = Ctor.constructor; if (init?.__md2fn) callMd2(init, args, inst); else if (typeof init === 'function' && init !== Object.prototype.constructor) init.apply(inst, args); stack.push(inst); } else if (Ctor === Proxy && args[1] && typeof args[1] === 'object') { const handler = {}; for (const key of Reflect.ownKeys(args[1])) { const trap = args[1][key]; handler[key] = trap?.__md2fn ? function(...trapArgs){ return callMd2(trap, trapArgs, args[1]); } : trap; } stack.push(new Proxy(args[0], handler)); } else stack.push(typeof Ctor === 'function' ? new Ctor(...args) : undefined); }
    else if (op === OP.CALL_METHOD_0) { const obj = pop(), fn = obj?.[program.pool[ins[1]]]; stack.push(fn?.__md2fn ? callMd2(fn, [], obj) : (typeof fn === 'function' ? fn.apply(obj, []) : undefined)); }
    else if (op === OP.CALL_METHOD_0) { const obj = pop(), fn = obj?.[program.pool[ins[1]]]; stack.push(fn?.__md2fn ? callMd2(fn, [], obj) : (typeof fn === 'function' ? fn.apply(obj, []) : undefined)); }
    else if (op === OP.CALL_METHOD) { const argc = ins[2], rawArgs = stack.splice(stack.length - argc, argc), args = wrapHostArgs(rawArgs); const obj = pop(), fn = obj?.[program.pool[ins[1]]]; stack.push(fn?.__md2fn ? callMd2(fn, rawArgs, obj) : (typeof fn === 'function' ? fn.apply(obj, args) : undefined)); }
    else if (op === OP.CALL_METHOD_SPREAD) { const args = pop() || [], obj = pop(), fn = obj?.[program.pool[ins[1]]]; stack.push(fn?.__md2fn ? callMd2(fn, Array.from(args), obj) : (typeof fn === 'function' ? fn.apply(obj, Array.from(args)) : undefined)); }
    else if (op === OP.CALL_FUNCTION_SPREAD) { const args = pop() || [], fn = pop(); stack.push(fn?.__md2fn ? callMd2(fn, Array.from(args)) : (typeof fn === 'function' ? fn(...Array.from(args)) : undefined)); }
    else if (op === OP.CALL_METHOD_SPREAD) { const args = pop() || [], obj = pop(), fn = obj?.[program.pool[ins[1]]]; stack.push(fn?.__md2fn ? callMd2(fn, Array.from(args), obj) : (typeof fn === 'function' ? fn.apply(obj, Array.from(args)) : undefined)); }
    else if (op === OP.CALL_FUNCTION_SPREAD) { const args = pop() || [], fn = pop(); stack.push(fn?.__md2fn ? callMd2(fn, Array.from(args)) : (typeof fn === 'function' ? fn(...Array.from(args)) : undefined)); }
    else if (op === OP.JUMP_IF_FALSE) { if (!pop()) ip = ins[1] - 1; }
    else if (op === OP.JUMP) ip = ins[1] - 1;
    else if (op === OP.POP) pop();
    else if (op === OP.RETURN) return pop();
    else throw new Error(`Bad MD2 JS op ${op}`);
  } return stack.at(-1); };
  let result;
  try { result = runCode(program.code, rootScope); }
  catch (err) { const wrapped = attachMode2Frame(err, { functionId: null, ip: null, opName: 'MAIN_FRAME' }); if (options.attachDecompiledContext) { const decompiler = createMode2Decompiler(); wrapped.decompiled = decompiler.toPseudoCode(program); wrapped.disassembly = decompiler.disassembleProgram(program); } throw wrapped; }
  flushTimers();
  result = rootScope.__awtsmoosResult !== undefined ? rootScope.__awtsmoosResult : result;
  return { ok: true, result, globals: { ...globals, ...rootScope }, program, arenas: makeMode2JsArenas(program) };
}
function isMode2JsBinary(buffer) { const b = Buffer.from(buffer || []); return b.slice(0, 4).toString('binary') === MAGIC && b[4] === SECTION_JS; }
function resolveMode2ModulePath(from, spec) { if (!spec.startsWith('.')) return spec; const base = from.split('/').slice(0, -1), parts = spec.split('/'); for (const part of parts) { if (!part || part === '.') continue; if (part === '..') base.pop(); else base.push(part); } let out = '/' + base.filter(Boolean).join('/'); return out.endsWith('.js') ? out : out + '.js'; }
function stripMode2EsmImports(source) { return source.replace(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g, (_, names, spec) => `const {${names}} = require(${JSON.stringify(spec)});`); }
function transformMode2CjsModule(source, moduleVar, exportsVar) {
  return source
    .replace(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g, (_, name, expr) => `${exportsVar}.${name} = ${expr};`)
    .replace(/export\s+let\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g, (_, name, expr) => `${exportsVar}.${name} = ${expr};`)
    .replace(/export\s+function\s+([A-Za-z_$][\w$]*)\s*\(/g, (_, name) => `${exportsVar}.${name} = function(`)
    .replace(/module\.exports\s*=\s*/g, `${moduleVar}.exports = `)
    .replace(/exports\.([A-Za-z_$][\w$]*)\s*=\s*/g, `${exportsVar}.$1 = `);
}
async function encodeMode2JsModuleGraph(graph) {
  const files = graph.files || {}, seen = new Set(), ordered = [];
  const visit = file => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = files[file];
    if (typeof source !== 'string') throw new Error(`Missing MD2 module ${file}`);
    source.replace(/(?:import\s*\{[^}]*\}\s*from|require\()\s*['"]([^'"]+)['"]\)?\s*;?/g, (_, spec) => {
      if (spec.startsWith('.')) visit(resolveMode2ModulePath(file, spec));
      return '';
    });
    ordered.push([file, source]);
  };
  const entry = graph.entry || '/index.js';
  visit(entry);
  const pieces = [`let __md2_modules = {}; let __md2_require = function(id){ return __md2_modules[id]; };`];
  let index = 0;
  for (const [file, source] of ordered) {
    if (file === entry) continue;
    const moduleVar = `__md2_module_${index}`;
    const exportsVar = `__md2_exports_${index}`;
    let body = stripMode2EsmImports(source);
    body = body.replace(/require\(['"]([^'"]+)['"]\)/g, (_, spec) => spec.startsWith('.') ? `__md2_require(${JSON.stringify(resolveMode2ModulePath(file, spec))})` : `require(${JSON.stringify(spec)})`);
    body = transformMode2CjsModule(body, moduleVar, exportsVar);
    pieces.push(`let ${moduleVar} = {exports:{}}; let ${exportsVar} = ${moduleVar}.exports; ${body}; __md2_modules[${JSON.stringify(file)}] = ${moduleVar}.exports;`);
    index++;
  }
  const mainModule = `__md2_module_main`;
  const mainExports = `__md2_exports_main`;
  let main = stripMode2EsmImports(files[entry] || '');
  main = main.replace(/require\(['"]([^'"]+)['"]\)/g, (_, spec) => spec.startsWith('.') ? `__md2_require(${JSON.stringify(resolveMode2ModulePath(entry, spec))})` : `require(${JSON.stringify(spec)})`);
  main = transformMode2CjsModule(main, mainModule, mainExports);
  pieces.push(`let ${mainModule} = {exports:{}}; let ${mainExports} = ${mainModule}.exports; ${main};`);
  return encodeMode2JsBinary(pieces.join('\n'));
}
function createMode2Decompiler() { return new Mode2DecompilerRuntime(OP); }
function createMode2Validator() { return new Mode2BytecodeValidator(OP); }
function validateMode2JsBinary(buffer) { return createMode2Validator().validate(decodeMode2JsBinary(buffer)); }
function analyzeMode2JsBinary(buffer) { const program = decodeMode2JsBinary(buffer); program.__opNames = Object.fromEntries(Object.entries(OP).map(([k, v]) => [v, k])); const slots = mode2SlotCompiler.createSlotPlan(program); const optimized = mode2Optimizer.optimize(program, OP); const validation = createMode2Validator().validate(program); delete program.__opNames; return { validation, slots, optimizer: optimized.report }; }
function disassembleMode2JsBinary(buffer) { return createMode2Decompiler().disassembleProgram(decodeMode2JsBinary(buffer)); }
function decompileMode2JsBinary(buffer) { return createMode2Decompiler().toPseudoCode(decodeMode2JsBinary(buffer)); }
module.exports = { MODE2_JS_MAGIC: MAGIC, MODE2_JS_SECTION_JS: SECTION_JS, MODE2_JS_OP: OP, isMode2JsBinary, encodeMode2JsBinary, encodeMode2JsModuleGraph, decodeMode2JsBinary, runMode2JsBinary, makeMode2JsArenas, createMode2Decompiler, createMode2Validator, validateMode2JsBinary, analyzeMode2JsBinary, disassembleMode2JsBinary, decompileMode2JsBinary };
