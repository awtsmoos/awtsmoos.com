// B"H
const PHASES = ['brainstorm', 'plan', 'do'];
const DEFAULT_PROMOTION_EVERY = 6;

/** B"H — Chapter 1960: The work turns like a three-faced wheel. */
function current(count = 0) { return PHASES[Math.max(0, Number(count || 0)) % PHASES.length]; }
function next(count = 0) { return current(Number(count || 0) + 1); }
function shouldPromote(count = 0, every = DEFAULT_PROMOTION_EVERY) {
  const n = Number(count || 0);
  const e = Math.max(1, Number(every || DEFAULT_PROMOTION_EVERY));
  return n > 0 && n % e === 0;
}
function instruction(phase = 'brainstorm', context = {}) {
  if (phase === 'brainstorm') return brainstorm(context);
  if (phase === 'plan') return plan(context);
  return doIt(context);
}
function brainstorm(c = {}) { return `B"H Brainstorm huge amounts of new ideas for ${goal(c)}. Go extremely broad; nothing is off the table. Return compact evidence and the next realistic planning angle.`; }
function plan(c = {}) { return `B"H Make a very specific realistic file plan and to-do ask for ${goal(c)}. Include absolute paths when known. Split aggressively into tiny files and tests.`; }
function doIt(c = {}) { return `B"H Do the next verified implementation step for ${goal(c)}. Keep changes small, test immediately, and return compact handoff.`; }
function goal(c = {}) { return c.goal || c.objective || 'the current Awtsmoos tunnel mission'; }
module.exports = { PHASES, DEFAULT_PROMOTION_EVERY, current, next, shouldPromote, instruction };
