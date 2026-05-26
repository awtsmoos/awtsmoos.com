// B"H
const { encodeSangArtifact } = require('./SangCodec.js');
const { tokenize, toPostfix } = require('./SangExpressionCompiler.js');
const OPS = { '+': 0x40, '-': 0x41, '*': 0x42, '/': 0x43, '%': 0x44 };

function emitExpression(source, constants, bytecode) {
  const add = value => constants.push(value) - 1;
  const u16 = n => bytecode.push(n & 255, (n >> 8) & 255);
  for (const token of toPostfix(tokenize(source))) {
    if (/^\d/.test(token)) { bytecode.push(0x13); u16(add(Number(token))); }
    else if (OPS[token]) bytecode.push(OPS[token]);
    else { bytecode.push(0x22); u16(add(token)); }
  }
}

/**
 * Strict JS compiler: tiny on purpose, honest by design.
 * It accepts `name = expression`, `return expression`, or a final expression.
 * The Awtsmoos begins with a narrow gate, because a true VM must widen only
 * after every byte is proven alive.
 */
function compileStrictJs(source) {
  const text = String(source).trim().replace(/;$/, '');
  const constants = [], bytecode = [];
  const assign = text.match(/^([A-Za-z_$][\w$]*)\s*=\s*(.+)$/);
  const ret = text.match(/^return\s+(.+)$/);
  const expr = assign ? assign[2] : ret ? ret[1] : text;
  emitExpression(expr, constants, bytecode);
  if (assign) {
    const idx = constants.push(assign[1]) - 1;
    bytecode.push(0x23, idx & 255, (idx >> 8) & 255);
    bytecode.push(0x22, idx & 255, (idx >> 8) & 255);
  }
  bytecode.push(0x01);
  return encodeSangArtifact({ constants, bytecode, meta: { kind: 'strict-js', source } });
}

module.exports = { compileStrictJs, emitExpression };
