// B"H
const fs = require('fs');

const required = [
  'bulk', 'tree', 'read', 'read64', 'readBytes',
  'grep', 'rg', 'rgbgrep', 'bulkSearch', 'bulkSearchPage',
  'commandTreeRun', 'commandTreeValidate', 'commandTreeDryRun',
  'commandTreeExplain', 'commandTreeVisualize', 'commandTreeResume',
  'commandTreeReplay', 'commandTreeCancel', 'commandTreeStatus',
  'commandTreeSave', 'commandTreeLoad', 'awtsmoosCommandTree', 'merkavaCommandTree'
];

function unique(values) {
  return [...new Set(values)].sort();
}

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function extractActionsJs(path) {
  const text = read(path);
  const match = text.match(/const actions = \[([\s\S]*?)\];/);
  if (!match) throw new Error('actions array not found in ' + path);
  return unique([...match[1].matchAll(/"([^"]+)"/g)].map(x => x[1]));
}

function extractYamlEnum(path) {
  const lines = read(path).split(/\r?\n/);
  const enumIndex = lines.findIndex(line => /^\s*enum:\s*$/.test(line));
  if (enumIndex < 0) throw new Error('action enum not found in ' + path);
  const out = [];
  for (let i = enumIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const item = line.match(/^\s{14}-\s+([A-Za-z0-9_]+)\s*$/);
    if (item) { out.push(item[1]); continue; }
    if (out.length && /^\s{8,}-\s+name:/.test(line)) break;
  }
  return unique(out);
}

const docs = extractActionsJs('geelooy/api/tunnel/control/docs/actions.js');
const yaml = extractYamlEnum('geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml');
const liveYaml = extractYamlEnum('geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml');

function diff(a, b) {
  const bs = new Set(b);
  return a.filter(x => !bs.has(x));
}

const report = {
  counts: { docs: docs.length, yaml: yaml.length, liveYaml: liveYaml.length },
  docsMissingFromYaml: diff(docs, yaml),
  yamlMissingFromDocs: diff(yaml, docs),
  docsMissingFromLiveYaml: diff(docs, liveYaml),
  liveYamlMissingFromDocs: diff(liveYaml, docs),
  requiredPresence: Object.fromEntries(required.map(name => [name, {
    docs: docs.includes(name),
    yaml: yaml.includes(name),
    liveYaml: liveYaml.includes(name)
  }])),
  yamlEqualsLiveYaml: JSON.stringify(yaml) === JSON.stringify(liveYaml)
};

console.log(JSON.stringify(report, null, 2));
const anyMissingRequired = Object.values(report.requiredPresence).some(x => !x.docs || !x.yaml || !x.liveYaml);
const anyDiff = report.docsMissingFromYaml.length || report.yamlMissingFromDocs.length || report.docsMissingFromLiveYaml.length || report.liveYamlMissingFromDocs.length;
process.exit(anyMissingRequired || anyDiff || !report.yamlEqualsLiveYaml ? 1 : 0);
