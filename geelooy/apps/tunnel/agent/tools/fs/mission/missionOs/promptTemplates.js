// B"H
function caps(mode) { return ({
  execute:['KEEP GOING','FINISH THE ACTIVE NODE NOW','DO NOT END WHILE REAL WORK REMAINS','REAL WORK FIRST'],
  verify:['KEEP GOING','VERIFY THE ACTIVE NODE NOW','EVERY WRITE REQUIRES READBACK','STORE THE RECEIPT'],
  unblock:['KEEP GOING','RECORD THE BLOCKER OR REMOVE IT WITH EVIDENCE','DO NOT PRETEND BLOCKED WORK IS DONE'],
  release:['RELEASE ONLY IF PROVEN','IF RELEASE IS NOT PROVEN, CREATE THE NEXT REAL NODE'],
  plan:['KEEP GOING','CREATE ONE REAL WORK NODE','PLANNING IS ONLY USEFUL IF IT UNLOCKS EXECUTION']
})[mode] || ['KEEP GOING','CHANGE REALITY NEXT']; }
function forbidden(mode) { const base = ['Do not summarize instead of acting.', 'Do not repeat old plans.', 'Do not invent evidence.', 'Do not end because the conversation feels complete.']; return mode === 'execute' ? [...base, 'Do not create new work before this node is closed unless steering records a replacement node.'] : base; }
function sentence(f) {
  if (f.active) return `You are working on ${f.active.type} node ${f.active.id}: ${f.active.title}. Complete it, verify it, or block it with proof.`;
  if (f.blocked.length) return `The mission is blocked by ${f.blocked.length} node(s). Keep going by proving a blocker, unblocking it, or creating a dependency node.`;
  return 'No active node is selected. Keep going by choosing or creating the next reality-changing node.';
}
function nextAction(f, missionId) {
  if (f.active && !f.active.receipts.length) return { action:'missionOsReceipt', missionId, nodeId:f.active.id, kind:f.active.type, summary:'PROOF FROM REAL WORK' };
  if (f.ready.length) return { action:'missionOsNext', missionId };
  if (f.debt.releaseBlockers || f.debt.receipts || f.debt.fileReads || f.debt.writeVerification) return { action:'missionOsKeepGoing', missionId, reason:'evidence_debt_or_blockers_remain' };
  return { action:'missionOsReleaseCourt', missionId };
}
module.exports = { caps, forbidden, sentence, nextAction };
