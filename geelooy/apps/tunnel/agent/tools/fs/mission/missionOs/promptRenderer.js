// B"H
const F = require('./promptFacts.js');
const T = require('./promptTemplates.js');

/**
 * B"H — The prompt is now a calm mission compass.
 * It tells the agent what to do next in natural English: steer when useful,
 * verify with evidence, and keep the mission alive until verified stop.
 */
function render(m, input = {}) {
  const f = F.facts(m), missionId = m.id, lines = ['Mission operating guidance'];
  lines.push('Continue the mission until the user gives a verified stop or safety blocks progress.');
  lines.push(T.sentence(f));
  if (input.steer) block(lines, 'Steering', ['You may choose a better unfinished work node when evidence supports it.', 'Steering changes direction; it does not end the mission.']);
  if (f.active) block(lines, 'Active work', activeLines(f.active));
  block(lines, 'Scoreboard', scoreLines(f.scoreboard));
  block(lines, 'Evidence debt', debtLines(f.debt));
  block(lines, 'Avoid', T.forbidden(f.mode));
  block(lines, 'Next useful action', [JSON.stringify(T.nextAction(f, missionId))]);
  return { mode:f.mode, instruction:lines.join('\n'), keepGoing:true, canSteer:true,
    allCaps:T.caps(f.mode), forbidden:T.forbidden(f.mode), scoreboard:f.scoreboard,
    evidenceDebt:f.debt, activeNode:f.active, nextAction:T.nextAction(f, missionId) };
}
function block(lines, title, body) { lines.push('', title); for (const item of body) lines.push(`- ${item}`); }
function activeLines(n) { return [`Type: ${n.type}`, `Status: ${n.status}`, `Title: ${n.title}`, `Purpose: ${n.purpose || 'not recorded'}`, `Files: ${(n.files || []).join(', ') || 'none'}`, `Verify by: ${n.verificationMethod || 'receipt required'}`]; }
function scoreLines(s) { return Object.entries(s).map(([k,v]) => `${k}: ${v}`); }
function debtLines(d) { return Object.entries(d).map(([k,v]) => `${k}: ${v}`); }
module.exports = { render };
