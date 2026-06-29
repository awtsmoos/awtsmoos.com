// B"H
const fs = require('fs');
const path = require('path');
const Markers = require('./markers.js');
const IGNORE = new Set(['.git','node_modules','.awtsmoos','.Awtsmoos','dist','build','.next']);
const CODE = new Set(['.js','.mjs','.cjs','.ts','.tsx','.jsx','.css','.html','.json','.md']);
function walk(root, dir='.', out=[]) {
  const full = path.join(root, dir);
  let list = [];
  try { list = fs.readdirSync(full, { withFileTypes:true }); } catch { return out; }
  for (const e of list) {
    if (IGNORE.has(e.name)) continue;
    const rel = path.join(dir, e.name).replace(/\\/g,'/');
    if (e.isDirectory()) walk(root, rel, out);
    else if (CODE.has(path.extname(e.name))) out.push(file(root, rel));
  }
  return out;
}
function file(root, rel) {
  const full = path.join(root, rel); let text = '', stat = null;
  try { text = fs.readFileSync(full, 'utf8'); stat = fs.statSync(full); } catch {}
  const lines = text ? text.split(/\r?\n/).length : 0;
  const markers = Markers.find(text).slice(0, 8).map(x => ({ lineNumber: x.lineNumber, preview: x.line.trim().slice(0, 160) }));
  return { path: rel, ext: path.extname(rel), bytes: stat?.size || 0, lines, todo: markers.length > 0, markers, syntaxTarget: /\.(mjs|cjs|js)$/i.test(rel) };
}
function discover(config={}, payload={}) {
  const root = path.resolve(config.root || process.cwd(), payload.path || payload.p || '.');
  const files = walk(root).slice(0, Number(payload.limit || 800));
  return { root, files, totals: { files: files.length, lines: files.reduce((a,x)=>a+x.lines,0), bytes: files.reduce((a,x)=>a+x.bytes,0), todos: files.filter(x=>x.todo).length } };
}
module.exports = { discover, walk, file };
