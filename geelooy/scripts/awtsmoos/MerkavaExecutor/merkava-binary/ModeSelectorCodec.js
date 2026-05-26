// B"H
const { SEL } = require('./ModeOpcodes.js');

function poolRef(pool, text) {
  const value = String(text || '');
  let index = pool.indexOf(value);
  if (index < 0) { index = pool.length; pool.push(value); }
  return index;
}
function splitGroups(selector) {
  const out = []; let depth = 0, buf = '';
  for (const ch of String(selector || '')) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { if (buf.trim()) out.push(buf.trim()); buf = ''; }
    else buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}
function tokenizeOne(text, pool) {
  const out = [];
  const hases = [...text.matchAll(/:has\(([^)]*)\)/g)].map(m => m[1]);
  text = text.replace(/:has\([^)]*\)/g, '');
  const tag = text.match(/^[a-zA-Z][\w-]*/);
  if (tag) out.push(SEL.TAG, poolRef(pool, tag[0]));
  const id = text.match(/#([\w-]+)/);
  if (id) out.push(SEL.ID, poolRef(pool, id[1]));
  for (const cls of text.matchAll(/\.([\w-]+)/g)) out.push(SEL.CLASS, poolRef(pool, cls[1]));
  for (const a of text.matchAll(/\[([\w:-]+)=?["']?([^"'\]]*)["']?\]/g)) out.push(SEL.ATTR_EQ, poolRef(pool, a[1]), poolRef(pool, a[2]));
  for (const p of text.matchAll(/:([\w-]+)(?!\()/g)) out.push(SEL.PSEUDO, poolRef(pool, p[1]));
  for (const h of hases) { out.push(SEL.HAS, ...tokenizeSelector(h, pool)); }
  return out;
}
function tokenizeSelector(selector, pool) {
  const out = [];
  for (const group of splitGroups(selector)) {
    if (out.length) out.push(SEL.GROUP);
    out.push(...tokenizeOne(group.trim(), pool));
  }
  out.push(SEL.END);
  return out;
}
function selectorTextFromTokens(tokens, pool) {
  let i = 0, parts = [], current = '';
  const readUntilEnd = () => {
    while (i < tokens.length) {
      const op = tokens[i++];
      if (op === SEL.END) return;
      if (op === SEL.GROUP) { parts.push(current); current = ''; continue; }
      if (op === SEL.TAG) current += pool[tokens[i++]] || '';
      else if (op === SEL.ID) current += '#' + (pool[tokens[i++]] || '');
      else if (op === SEL.CLASS) current += '.' + (pool[tokens[i++]] || '');
      else if (op === SEL.ATTR_EQ) current += `[${pool[tokens[i++]] || ''}="${pool[tokens[i++]] || ''}"]`;
      else if (op === SEL.PSEUDO) current += ':' + (pool[tokens[i++]] || '');
      else if (op === SEL.HAS) {
        const start = i;
        while (i < tokens.length && tokens[i] !== SEL.END) i++;
        const inner = tokens.slice(start, i + 1);
        i++;
        current += `:has(${selectorTextFromTokens(inner, pool)})`;
      }
    }
  };
  readUntilEnd();
  if (current || !parts.length) parts.push(current);
  return parts.filter(Boolean).join(', ');
}
module.exports = { tokenizeSelector, selectorTextFromTokens };
