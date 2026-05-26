// B"H
function attrSignature(attrs = {}) {
  return Object.entries(attrs).filter(([k]) => k !== 'id').sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('&');
}
function templateKey(node = {}) {
  return [node.tag || '', node.parent || '', attrSignature(node.attrs || {})].join('|');
}
function buildTemplateTable(nodes = []) {
  const counts = new Map();
  for (const n of nodes) counts.set(templateKey(n), (counts.get(templateKey(n)) || 0) + 1);
  const templates = [];
  const index = new Map();
  for (const n of nodes) {
    const key = templateKey(n);
    if ((counts.get(key) || 0) < 3 || index.has(key)) continue;
    const id = templates.length;
    index.set(key, id);
    templates.push({ tag: n.tag || '', parent: n.parent || '', attrs: Object.fromEntries(Object.entries(n.attrs || {}).filter(([k]) => k !== 'id')) });
  }
  return { templates, index };
}
function templateIdFor(index, node = {}) {
  return index.has(templateKey(node)) ? index.get(templateKey(node)) : -1;
}
module.exports = { attrSignature, templateKey, buildTemplateTable, templateIdFor };
