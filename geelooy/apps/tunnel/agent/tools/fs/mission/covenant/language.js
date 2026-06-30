// B"H
const GUIDANCE = [
  'You completed a step, not necessarily the mission.',
  'Choose the next useful unfinished work, or steer if new evidence points elsewhere.',
  'If you are blocked, say what blocks you and choose a recovery path.',
  'Only stop for verified user stop, safety, tool loss, lease expiration, fatal corruption, or an explicit testing emergency.'
];
const QUESTIONS = ['What is still unfinished?','What changed because of this action?','What needs verification?','What should be simplified while context is fresh?','What should be documented or delegated?'];
/** B"H — A calm voice for a tireless mission partner. */
function instruction(next, issues = []) {
  const action = next?.action || 'missionCycle';
  const reason = issues.length ? ` Current blocker: ${issues.join(', ')}.` : '';
  return `This is a checkpoint, not a forced ending.${reason} Please continue with ${action}, or steer to higher-value safe work and leave a receipt.`;
}
function checkpointMessage() { return 'Checkpoint reached. Please continue with the next useful safe step.'; }
module.exports = { GUIDANCE, QUESTIONS, instruction, checkpointMessage };
