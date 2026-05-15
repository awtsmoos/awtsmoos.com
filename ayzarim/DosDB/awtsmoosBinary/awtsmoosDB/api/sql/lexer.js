// B"H

/**
 * @file api/sql/lexer.js
 * @chapter Sparks Into Tokens
 * @description Splits SQL text into small exact signs for the parser.
 */

/**
 * @function lex
 * @param {string} sql - SQL source.
 * @returns {Array<object>} Tokens.
 */
function lex(sql) {
  const tokens = [];
  const re = /\s+|(--.*$)|('[^']*(?:''[^']*)*')|("[^"]+")|(\?\?)|([(),=*<>])|([A-Za-z_][\w.]*)|(-?\d+(?:\.\d+)?)/gm;
  let match;
  while ((match = re.exec(String(sql || '')))) {
    if (match[0].trim() === '' || match[1]) continue;
    if (match[2]) tokens.push({ type: 'string', value: match[2].slice(1, -1).replace(/''/g, "'") });
    else if (match[3]) tokens.push({ type: 'id', value: match[3].slice(1, -1) });
    else if (match[4]) tokens.push({ type: 'param', value: '??' });
    else if (match[5]) tokens.push({ type: match[5], value: match[5] });
    else if (match[6]) tokens.push({ type: 'word', value: match[6].toUpperCase(), raw: match[6] });
    else if (match[7]) tokens.push({ type: 'number', value: Number(match[7]) });
  }
  return tokens;
}

module.exports = { lex };
