// B"H
function add(m, input = {}) {
  m.selfImproveReceipts ||= [];
  const receipt = {
    id: `sir_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 8)}`,
    at: new Date().toISOString(), agentId: input.agentId || 'single_agent',
    role: input.role || '', stage: input.stage || 'pulse', action: input.action || '',
    noveltyScore: input.noveltyScore || 0, innovations: input.innovations || 0,
    proof: input.proof || '', next: input.next || null
  };
  m.selfImproveReceipts.push(receipt);
  return receipt;
}
function status(m) { const list = m.selfImproveReceipts || []; return { count: list.length, recent: list.slice(-20) }; }
module.exports = { add, status };
