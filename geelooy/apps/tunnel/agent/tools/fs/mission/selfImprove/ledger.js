// B"H
const CATS = ['correctness','tests','architecture','docs','ux','agent_coordination','performance','security','observability','tooling'];
function ensure(m) { m.innovationLedger ||= []; return m.innovationLedger; }
function add(m, input = {}) {
  const ledger = ensure(m);
  const items = normalize(input);
  for (const item of items) ledger.push(item);
  return { added: items, total: ledger.length, byCategory: counts(ledger) };
}
function normalize(input) {
  const raw = input.items || input.ideas || input.innovations || [`Improve ${input.focus || 'the mission'} with more proof.`];
  return (Array.isArray(raw) ? raw : String(raw).split(/\n|,/)).filter(Boolean).map((text, i) => ({ id: `innovation_${Date.now().toString(36)}_${i}`, at: new Date().toISOString(), category: cat(input.category, i), text: String(text).trim(), status: 'open' }));
}
function cat(value, i) { return CATS.includes(String(value).toLowerCase()) ? String(value).toLowerCase() : CATS[i % CATS.length]; }
function counts(list) { return list.reduce((a, x) => (a[x.category] = (a[x.category] || 0) + 1, a), {}); }
function status(m) { const ledger = ensure(m); return { total: ledger.length, open: ledger.filter(x => x.status !== 'done').length, byCategory: counts(ledger), recent: ledger.slice(-20) }; }
module.exports = { CATS, ensure, add, status };
