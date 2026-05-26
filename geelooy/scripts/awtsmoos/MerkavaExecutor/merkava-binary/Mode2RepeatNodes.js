// B"H
function parseSuffix(value = '') {
  const m = String(value).match(/^(.*?)(\d+)$/);
  return m && { prefix: m[1], num: Number(m[2]) };
}
function sameAttrs(a = {}, b = {}) {
  const ax = Object.entries(a).filter(([k]) => k !== 'id').sort();
  const bx = Object.entries(b).filter(([k]) => k !== 'id').sort();
  return JSON.stringify(ax) === JSON.stringify(bx);
}
function findRepeatRun(nodes, start) {
  const first = nodes[start], id0 = parseSuffix(first?.id), text0 = parseSuffix(first?.text);
  if (!first || !id0) return null;
  let count = 1;
  for (let i = start + 1; i < nodes.length; i++) {
    const n = nodes[i], id = parseSuffix(n.id), text = parseSuffix(n.text);
    if (!id || id.prefix !== id0.prefix || id.num !== id0.num + count) break;
    if (n.tag !== first.tag || n.parent !== first.parent || !sameAttrs(n.attrs, first.attrs)) break;
    if ((text0 || text) && (!text || !text0 || text.prefix !== text0.prefix || text.num !== text0.num + count)) break;
    count++;
  }
  return count >= 3 ? { first, id0, text0, count } : null;
}
function compressRepeatNodes(nodes = []) {
  const out = [];
  for (let i = 0; i < nodes.length; i++) {
    const run = findRepeatRun(nodes, i);
    if (!run) { out.push({ type: 'node', node: nodes[i] }); continue; }
    out.push({ type: 'repeat', ...run });
    i += run.count - 1;
  }
  return out;
}
module.exports = { compressRepeatNodes };
