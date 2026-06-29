// B"H
function caps(mode) { return ({
  execute:['FINISH THE ACTIVE NODE NOW','DO NOT PLAN WHILE READY WORK EXISTS','REAL WORK FIRST'],
  verify:['VERIFY THE ACTIVE NODE NOW','EVERY WRITE REQUIRES READBACK','STORE THE RECEIPT'],
  unblock:['RECORD THE BLOCKER OR REMOVE IT WITH EVIDENCE','DO NOT PRETEND BLOCKED WORK IS DONE'],
  release:['PROVE RELEASE WITH RECEIPTS','NO RELEASE WHILE REQUIRED NODES REMAIN'],
  plan:['CREATE ONE REAL WORK NODE','PLANNING IS ONLY USEFUL IF IT UNLOCKS EXECUTION']
})[mode] || ['CHANGE REALITY NEXT']; }
function forbidden(mode) { const base = ['Do not summarize instead of acting.', 'Do not repeat old plans.', 'Do not invent evidence.']; return mode === 'execute' ? [...base, 'Do not create new work before this node is closed.'] : base; }
function sentence(f) {
  if (f.active) return `You are working on ${f.active.type} node ${f.active.id}: ${f.active.title}.`;
  if (f.blocked.length) return `The mission is blocked by ${f.blocked.length} node(s). Record exact blocker proof or unblock one.`;
  return 'No active node is selected. Choose the next reality-changing node.';
}
function nextAction(f, missionId) {
  if (f.active && !f.active.receipts.length) return { action:'missionOsReceipt', missionId, nodeId:f.active.id, kind:f.active.type, summary:'PROOF FROM REAL WORK' };
  if (f.ready.length) return { action:'missionOsNext', missionId };
  return { action:'missionOsReleaseCourt', missionId };
}
module.exports = { caps, forbidden, sentence, nextAction };
