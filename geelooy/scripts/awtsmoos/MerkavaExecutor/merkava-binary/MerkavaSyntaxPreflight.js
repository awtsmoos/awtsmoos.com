// B"H
function lineColumnFor(source, index) {
  const before = String(source || '').slice(0, Math.max(0, index));
  const lines = before.split(/\r?\n/);
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function codeFrame(source, index) {
  const text = String(source || '');
  const where = lineColumnFor(text, index);
  const row = text.split(/\r?\n/)[where.line - 1] || '';
  return String(where.line) + ':' + String(where.column) + '\n' + row + '\n' + ' '.repeat(Math.max(0, where.column - 1)) + '^';
}

function makeSyntaxError(message, source, index, file = '<anonymous>') {
  const where = lineColumnFor(source, index);
  const error = new SyntaxError(message + ' at ' + file + ':' + where.line + ':' + where.column);
  error.code = 'MERKAVA_JS_SYNTAX_ERROR';
  error.file = file;
  error.line = where.line;
  error.column = where.column;
  error.index = index;
  error.frame = codeFrame(source, index);
  return error;
}

/**
 * B"H
 * Chapter 109: the syntax gate learned humility around template rivers.
 *
 * It catches broken delimiter, string, and comment structure before source is
 * lowered to SANG bytecode, while allowing template literal interpolation to
 * pass to the real parser instead of pretending every ${...} is a raw block.
 */
function assertBasicJsSyntax(source, file = '<anonymous>') {
  const text = String(source || '');
  const stack = [];
  let quote = null;
  for (let index = 0; index < text.length; index += 1) {
    const ch = text[index];
    const next = text[index + 1];
    if (quote) {
      if (ch === '\\') { index += 1; continue; }
      if (quote === '`' && ch === '$' && next === '{') { index += 1; continue; }
      if (ch === quote) { quote = null; continue; }
      continue;
    }
    if (ch === '/' && next === '/') {
      while (index < text.length && !/\r|\n/.test(text[index])) index += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = text.indexOf('*/', index + 2);
      if (end < 0) throw makeSyntaxError('Unterminated block comment', text, index, file);
      index = end + 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '(' || ch === '[' || ch === '{') { stack.push({ ch, index }); continue; }
    if (ch === ')' || ch === ']' || ch === '}') {
      const open = stack.pop();
      if (!open) throw makeSyntaxError('Unexpected closing ' + ch, text, index, file);
      const wants = open.ch === '(' ? ')' : open.ch === '[' ? ']' : '}';
      if (ch !== wants) throw makeSyntaxError('Mismatched closing ' + ch + '; expected ' + wants, text, index, file);
    }
  }
  if (quote) throw makeSyntaxError('Unterminated ' + (quote === '`' ? 'template' : 'string') + ' literal', text, text.length - 1, file);
  if (stack.length) {
    const open = stack[stack.length - 1];
    const wants = open.ch === '(' ? ')' : open.ch === '[' ? ']' : '}';
    throw makeSyntaxError('Unclosed ' + open.ch + '; expected ' + wants, text, open.index, file);
  }
  return true;
}

module.exports = { assertBasicJsSyntax, makeSyntaxError, codeFrame, lineColumnFor };
