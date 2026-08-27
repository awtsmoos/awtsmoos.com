// B"H

/**
 * @file api/graphql/lexer.js
 * @chapter Braces Become Gates
 * @description Tiny GraphQL lexer for AwtsmoosDB query and mutation forms.
 */

function lex(source) {
  const tokens = [];
  const re = /\s+|(#.*$)|([{}():,\[\]])|("[^"]*")|(-?\d+(?:\.\d+)?)|([A-Za-z_][\w]*)/gm;
  let m;
  while ((m = re.exec(String(source || '')))) {
    if (m[0].trim() === '' || m[1]) continue;
    if (m[2]) tokens.push({ type: m[2], value: m[2] });
    else if (m[3]) tokens.push({ type: 'string', value: m[3].slice(1, -1) });
    else if (m[4]) tokens.push({ type: 'number', value: Number(m[4]) });
    else if (m[5]) tokens.push({ type: 'name', value: m[5] });
  }
  return tokens;
}

module.exports = { lex };
