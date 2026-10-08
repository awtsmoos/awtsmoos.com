//B"H
// voice-to-css/approver.mjs — in-memory proposal store for CSS changes.
// Yaakov approves (YES) or cancels (NO) each proposed change in chat;
// the tunnel deploy pipeline consumes the deploy plan from approve().
// ESM, no external deps, node --check clean.

/**
 * DIFF SHAPE (input, from generator.mjs):
 * { selector, declarations, css, summary }
 * PROPOSAL SHAPE:
 * { id, diff, status: 'pending'|'approved'|'rejected', createdAt, decidedAt }
 */

const store = new Map();

function randomId() {
  // 8 random hex chars
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return 'prop_' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function requireDiff(diff) {
  if (!diff || typeof diff !== 'object') {
    throw new TypeError('propose(diff): diff must be an object');
  }
  if (typeof diff.selector !== 'string' || typeof diff.css !== 'string') {
    throw new TypeError('propose(diff): diff.selector and diff.css must be strings');
  }
}

function requirePending(proposal, action) {
  if (!proposal) throw new Error(`${action}: unknown proposal id`);
  if (proposal.status !== 'pending') {
    throw new Error(`${action}: proposal ${proposal.id} is already ${proposal.status}`);
  }
}

export function propose(diff) {
  requireDiff(diff);
  const id = randomId();
  const proposal = {
    id,
    diff: { ...diff },
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  store.set(id, proposal);
  return { ...proposal };
}

export function approve(id) {
  const proposal = store.get(id);
  requirePending(proposal, 'approve');
  proposal.status = 'approved';
  proposal.decidedAt = new Date().toISOString();
  const deployPlan = {
    cssFile: 'meluket-sefer.css',
    cssText: proposal.diff.css,
    selector: proposal.diff.selector,
    summary: proposal.diff.summary,
  };
  return { id: proposal.id, status: 'approved', deployPlan };
}

export function reject(id) {
  const proposal = store.get(id);
  requirePending(proposal, 'reject');
  proposal.status = 'rejected';
  proposal.decidedAt = new Date().toISOString();
  return { id: proposal.id, status: 'rejected' };
}

export function get(id) {
  const proposal = store.get(id);
  return proposal ? { ...proposal } : null;
}

export function listPending() {
  return Array.from(store.values())
    .filter((p) => p.status === 'pending')
    .map((p) => ({ ...p }));
}

export function formatForChat(proposal) {
  if (!proposal || typeof proposal !== 'object' || !proposal.diff) {
    throw new TypeError('formatForChat(proposal): proposal with diff required');
  }
  const summary = proposal.diff.summary || 'CSS change';
  const css = proposal.diff.css || '';
  const label = summary.charAt(0).toUpperCase() + summary.slice(1);
  return (
    `Change: ${label}\n` +
    `CSS:\n${css}\n` +
    `Reply YES to deploy, NO to cancel.`
  );
}
