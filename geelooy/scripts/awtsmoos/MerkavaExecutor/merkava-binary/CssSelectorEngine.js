// B"H
function allElements(root, out = []) {
  for (const c of root?.children || []) { out.push(c); allElements(c, out); }
  return out;
}
function cleanPseudo(selector) {
  return String(selector || '').replace(/:(hover|active|focus|focus-visible|focus-within|visited|link|root|scope)\b/g, '');
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
function lastCompound(selector) {
  const text = String(selector || '');
  if (text.includes(':has(')) return text;
  const parts = text.split(/\s+|>|\+|~/).filter(Boolean);
  return parts[parts.length - 1] || selector;
}
function attrCompare(value, op, want) {
  value = String(value); want = String(want);
  if (op === '=') return value === want;
  if (op === '~=') return value.split(/\s+/).includes(want);
  if (op === '|=') return value === want || value.startsWith(want + '-');
  if (op === '^=') return value.startsWith(want);
  if (op === '$=') return value.endsWith(want);
  if (op === '*=') return value.includes(want);
  return false;
}
function matchesCompound(el, raw) {
  let s = cleanPseudo(raw).trim();
  const has = [...s.matchAll(/:has\(([^)]*)\)/g)].map(m => m[1]);
  s = s.replace(/:has\([^)]*\)/g, '');
  if (!s || s === '*') return has.every(sel => queryWithin(el, sel).length);
  const id = s.match(/#([\w-]+)/); if (id && el.id !== id[1]) return false;
  for (const cls of s.matchAll(/\.([\w-]+)/g)) if (!String(el.className || '').split(/\s+/).includes(cls[1])) return false;
  for (const a of s.matchAll(/\[([\w:-]+)(?:([~|^$*]?=)(["']?)([^"'\]]+)\3)?\]/g)) {
    const v = el.getAttribute?.(a[1]); if (v == null) return false;
    if (a[2] && !attrCompare(v, a[2], a[4])) return false;
  }
  const tag = s.match(/^[a-zA-Z][\w-]*/); if (tag && el.tagName?.toLowerCase() !== tag[0].toLowerCase()) return false;
  return has.every(sel => queryWithin(el, sel).length);
}
function queryWithin(root, selector) {
  const found = new Set(); const all = allElements(root, []);
  for (const group of splitGroups(selector)) for (const el of all) if (matchesCompound(el, lastCompound(group))) found.add(el);
  return [...found];
}
function querySelectorAllStub(document, selector) {
  const found = new Set(); const all = allElements(document.body, [document.body]);
  for (const group of splitGroups(selector)) for (const el of all) if (matchesCompound(el, lastCompound(group))) found.add(el);
  return [...found];
}
function specificity(selector) {
  let best = 0;
  for (const g of splitGroups(selector)) {
    const a = (g.match(/#[\w-]+/g) || []).length;
    const b = (g.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length;
    const c = (g.match(/(^|[\s>+~])[a-zA-Z][\w-]*/g) || []).length + (g.match(/::[\w-]+/g) || []).length;
    best = Math.max(best, a * 10000 + b * 100 + c);
  }
  return best;
}
module.exports = { allElements, querySelectorAllStub, matchesCompound, specificity, splitGroups };
