// B"H
function score(input = {}, m = {}) {
  let points = 0; const reasons = [];
  add(input.file || input.files || input.newFileInspected, 5, 'new_file_inspected');
  add(input.test || input.tests || input.newTestAdded, 7, 'new_test_added');
  add(input.bug || input.bugs || input.newBugFound, 8, 'new_bug_found');
  add(input.abstraction || input.refactor, 6, 'new_abstraction');
  add(input.failureMode || input.failureModes, 6, 'failure_mode_simulated');
  add(input.proof || input.evidence, 4, 'proof_generated');
  add(input.interruptResolved, 3, 'interrupt_resolved');
  add(input.roomMessageHandled, 2, 'room_message_handled');
  if (!reasons.length) { points = 1; reasons.push('minimal_progress'); }
  const rec = { at: new Date().toISOString(), score: points, reasons };
  m.noveltyHistory ||= []; m.noveltyHistory.push(rec);
  return rec;
  function add(v, n, reason) { if (Array.isArray(v) ? v.length : !!v) { points += n; reasons.push(reason); } }
}
function status(m) { const hist = m.noveltyHistory || []; return { totalScore: hist.reduce((a, x) => a + (x.score || 0), 0), count: hist.length, recent: hist.slice(-10) }; }
module.exports = { score, status };
