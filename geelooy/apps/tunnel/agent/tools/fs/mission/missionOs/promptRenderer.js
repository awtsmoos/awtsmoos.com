// B"H
const F = require('./promptFacts.js');
const T = require('./promptTemplates.js');
function render(m, input = {}) {
  const f = F.facts(m), missionId = m.id, lines = [];
  lines.push('########################################');
  lines.push('MISSION OPERATING SYSTEM');
  lines.push('KEEP GOING UNTIL RELEASE IS PROVEN');
  lines.push('########################################');
  lines.push(...T.caps(f.mode));
  lines.push('');
  lines.push(T.sentence(f));
  if (input.steer) block(lines, 'STEERING ALLOWED', ['You may change direction only by creating or selecting a real work node.', 'Steering must not end the mission.']);
  if (f.active) block(lines, 'ACTIVE NODE', activeLines(f.active));
  block(lines, 'SCOREBOARD', scoreLines(f.scoreboard));
  block(lines, 'EVIDENCE DEBT', debtLines(f.debt));
  block(lines, 'FORBIDDEN', T.forbidden(f.mode));
  block(lines, 'NEXT REQUIRED ACTION', [JSON.stringify(T.nextAction(f, missionId))]);
  lines.push('########################################');
  return { mode:f.mode, instruction:lines.join('\n'), keepGoing:true, canSteer:true, allCaps:T.caps(f.mode), forbidden:T.forbidden(f.mode), scoreboard:f.scoreboard, evidenceDebt:f.debt, activeNode:f.active, nextAction:T.nextAction(f, missionId) };
}
function block(lines, title, body) { lines.push(''); lines.push(title); lines.push('-'.repeat(title.length)); for (const x of body) lines.push(String(x)); }
function activeLines(n) { return [`TYPE: ${n.type}`, `STATUS: ${n.status}`, `TITLE: ${n.title}`, `PURPOSE: ${n.purpose || 'not recorded'}`, `FILES: ${(n.files || []).join(', ') || 'none'}`, `VERIFY BY: ${n.verificationMethod || 'receipt required'}`]; }
function scoreLines(s) { return Object.entries(s).map(([k,v]) => `${k}: ${v}`); }
function debtLines(d) { return Object.entries(d).map(([k,v]) => `${k}: ${v}`); }
/**
 * B"H
 * The mission bell no longer whispers finish. It sings: keep going, but steer
 * with evidence; bend the river, do not dry it, until release is proven.
 */
module.exports = { render };
