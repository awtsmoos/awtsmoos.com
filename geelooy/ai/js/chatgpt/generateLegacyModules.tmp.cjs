//B"H
const fs = require('fs');
const path = require('path');
const root = path.join('geelooy', 'ai');
const old = fs.readFileSync(path.join(root, 'old.AwtsmoosGPTify.reference.js'), 'utf8');

function ensure(p) {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
}

function write(p, content) {
  ensure(p);
  fs.writeFileSync(path.join(root, p), content);
  console.log('wrote', p, content.length);
}

function extractFunction(src, name) {
  const idx = src.indexOf(`function ${name}`);
  if (idx < 0) throw new Error('missing ' + name);
  const brace = src.indexOf('{', idx);
  let depth = 0;
  let inStr = null;
  let esc = false;
  let inLine = false;
  let inBlock = false;
  for (let i = brace; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === inStr) inStr = null; continue; }
    if (c === '/' && n === '/') { inLine = true; i++; continue; }
    if (c === '/' && n === '*') { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    if (c === '}') { depth--; if (depth === 0) return src.slice(idx, i + 1); }
  }
  throw new Error('unterminated ' + name);
}

const tokenClass = extractFunction(old, 'getTokenClass');
write('js/chatgpt/sentinel/tokenClassLegacy.js', `//B"H\n\n${tokenClass}\n\nexport { getTokenClass };\n`);
