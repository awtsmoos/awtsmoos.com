// B"H
const { encodeSangArtifact } = require('./SangCodec.js');
const OPS = { '+': 0x40, '-': 0x41, '*': 0x42, '/': 0x43, '%': 0x44 };
const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };

function tokenize(source) {
  return String(source).match(/[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|[()+\-*/%]/g) || [];
}

function toPostfix(tokens) {
  const out = [], ops = [];
  for (const token of tokens) {
    if (/^\d/.test(token) || /^[A-Za-z_$]/.test(token)) out.push(token);
    else if (token === '(') ops.push(token);
    else if (token === ')') { while (ops.at(-1) !== '(') out.push(ops.pop()); ops.pop(); }
    else { while (PREC[ops.at(-1)] >= PREC[token]) out.push(ops.pop()); ops.push(token); }
  }
  return out.concat(ops.reverse());
}

/**
 * Compiles a strict expression subset into real Merkava opcodes.
 * This first gate accepts numbers, globals, parentheses, and arithmetic,
 * letting the Awtsmoos prove binary execution before the whole language enters.
 */
function compileExpression(source, meta = {}) {
  const constants = [];
  const bytecode = [];
  const add = value => constants.push(value) - 1;
  const u16 = n => { bytecode.push(n & 255, (n >> 8) & 255); };
  for (const token of toPostfix(tokenize(source))) {
    if (/^\d/.test(token)) { bytecode.push(0x13); u16(add(Number(token))); }
    else if (OPS[token]) bytecode.push(OPS[token]);
    else { bytecode.push(0x22); u16(add(token)); }
  }
  bytecode.push(0x01);
  return encodeSangArtifact({ constants, bytecode, meta: { kind: 'expression', source, ...meta } });
}

module.exports = { compileExpression, tokenize, toPostfix };
