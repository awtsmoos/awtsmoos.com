// B"H
const fs = require('fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }
function extractArray(text, name) {
  const match = text.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\[([\\s\\S]*?)\\];'));
  if (!match) throw new Error('Missing array ' + name);
  return [...match[1].matchAll(/"([^"]+)"/g)].map(x => x[1]).sort();
}
function extractDocs() {
  const text = read('geelooy/api/tunnel/control/docs/actions.js');
  return extractArray(text, 'actions');
}
const api = extractArray(read('geelooy/api/tunnel/control/routes/osFs/commandTree.js'), 'COMMAND_TREE_ACTIONS');
const agent = extractArray(read('geelooy/apps/tunnel/agent/tools/fs/actionGroups/workflowActions.js'), 'commandTreeAliases');
const docs = extractDocs();
const required = [...new Set([...api, ...agent].filter(x => /commandTree|awtsmoosCommandTree|merkavaCommandTree|aiWorkflowLang|parallelActionBatch|forEachActionBatch|retryAction|assertAction|snapshotBeforeAfter|policyGuard|destructiveIntentGate/.test(x)))].sort();
function diff(a,b){ const bs=new Set(b); return a.filter(x=>!bs.has(x)); }
const report = {
  counts: { api: api.length, agent: agent.length, required: required.length },
  agentMissingFromApi: diff(agent, api),
  apiMissingFromAgent: diff(api, agent),
  requiredMissingFromDocs: diff(required, docs),
  requiredPresence: Object.fromEntries(required.map(x => [x, { api: api.includes(x), agent: agent.includes(x), docs: docs.includes(x) }]))
};
console.log(JSON.stringify(report, null, 2));
process.exit(report.agentMissingFromApi.length || report.apiMissingFromAgent.length || report.requiredMissingFromDocs.length ? 1 : 0);
