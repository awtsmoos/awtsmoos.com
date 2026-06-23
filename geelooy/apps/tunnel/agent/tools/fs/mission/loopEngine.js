// B"H
const crypto = require('crypto');
const { event, addTask, checkpoint, selfMailDraft, counts } = require('./core.js');

const LOOP_FAMILIES = Object.freeze([
  'assumptions',
  'evidence',
  'implementation',
  'tests',
  'documentation',
  'api-schema',
  'compatibility',
  'migration',
  'observability',
  'recovery',
  'rollback',
  'performance',
  'security',
  'multi-agent',
  'path-correlation',
  '504-resilience',
  'ux',
  'automation',
  'research',
  'future-risk',
  'optimization',
  'handoff'
]);

const IMPROVEMENTS = Object.freeze([
  'Falsify the latest success claim with a direct test.',
  'Turn every assumption into an evidence item or debt item.',
  'Create the next smallest reversible chunk.',
  'Prefer a real command, API call, or file read over a summary.',
  'Search for stale output, wrong job ids, wrong tunnel names, and wrong vessels.',
  'Add tests for any behavior that changed.',
  'Add documentation debt when an API, route, or payload changed.',
  'Add compatibility debt when public action schemas changed.',
  'Add migration debt when stored mission JSON changes.',
  'Add observability debt when deployment or tunnels changed.',
  'Add recovery and rollback debt after deployment changes.',
  'Checkpoint before long pauses or context compaction.',
  'Thaw from the latest checkpoint after context loss.',
  'Review planned files against actual files touched.',
  'Review planned tests against tests actually run.',
  'Review whether read-before-write happened.',
  'Review whether full-file rewrite was used where required.',
  'Generate a next plan even after a clean review.',
  'Escalate only with blocker proof.',
  'Keep a live list of hidden dependencies.',
  'Inspect logs after a successful deploy.',
  'Run public API checks after local checks.',
  'Run local native checks after public checks.',
  'Audit routeReason, targetVessel, and tunnelName after tunnel calls.',
  'Reject ok=true when identity fields mismatch.',
  'Group work by families and burn down one family at a time.',
  'Create follow-up research tasks for unclear domains.',
  'Create performance probes for long-running loops.',
  'Create security probes for write and command paths.',
  'Create UI inspection tasks for overlay and responsive problems.',
  'Create API schema round-trip tests for GPT Actions.',
  'Create path-correlation tests for absolute and relative paths.',
  'Create job-output tests for wrong job id contamination.',
  'Create stale-command tests for command lifecycle contamination.',
  'Record exact resume instructions before pausing.',
  'Record exact next action payload, not just prose.',
  'Prefer missionNextPlan over final answers while any family remains open.',
  'Use missionRefrigerate when a loop crosses a natural boundary.',
  'Use missionStepBrainstorm before each new chunk.',
  'Use missionFilesToTouch or missionChunkPlan before any intended write.',
  'Use missionStepReview after execution.',
  'Use missionStepDelta when anything planned is missing.',
  'Use missionExpand after clean reviews to discover more work.',
  'Use missionPostCompletion before final completion.',
  'Ask what another engineer would inspect.',
  'Ask what future bug this change could create.',
  'Ask what evidence would disprove completion.',
  'Ask what hidden dependency was introduced.',
  'Ask what should be documented.',
  'Ask what should be automated next.',
  'Keep a bounded but renewable work queue.',
  'Detect repeated tasks and mutate the next plan.',
  'Prefer concrete file/action/test names in every task.',
  'Keep planned-vs-actual deltas visible.',
  'Keep long-run cycles count visible.',
  'Keep watchdog timestamps visible.',
  'Keep final answer locked until all gates pass.',
  'Mark unsafe separately from blocked.',
  'Keep user prompts out of the loop unless proof says user is required.',
  'Keep improving the mission ecosystem itself.'
]);

function now() { return new Date().toISOString(); }
function id(prefix) { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`; }
function arr(v) {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return v.split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
  }
  return [];
}
function rawItems(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return arr(v);
  }
  return [];
}
function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}
function ensure(m) {
  m.longRun ||= {
    id: id('longrun'),
    createdAt: now(),
    updatedAt: now(),
    mode: 'hours',
    cycles: 0,
    maxCycles: 1000000,
    families: LOOP_FAMILIES.map(name => ({ name, status: 'open', cycles: 0 })),
    queue: [],
    pulses: [],
    watchdog: [],
    improvements: [],
    stopGates: {
      noOpenTasks: false,
      noEvidenceDebt: false,
      noPlanDelta: false,
      noUntestedChanges: false,
      noDocDebt: false,
      noRiskDebt: false,
      userDidNotStop: true
    }
  };
  m.longRun.updatedAt = now();
  return m.longRun;
}
function seed(m, input = {}) {
  const loop = ensure(m);
  loop.mode = input.mode || loop.mode || 'hours';
  loop.maxCycles = num(input.maxCycles, loop.maxCycles || 1000000);
  const focus = arr(input.focus || input.families);
  const families = focus.length ? focus : LOOP_FAMILIES;
  const made = [];
  for (const family of families) {
    const title = `Long-run ${family} obligation for: ${m.goal}`;
    const exists = loop.queue.some(item => item.title === title && item.status !== 'done');
    if (exists) continue;
    const item = queueItem(family, title, input);
    loop.queue.push(item);
    made.push(item);
    addTask(m, title, { status: 'open', kind: 'long-run' });
  }
  loop.improvements = [...new Set([...(loop.improvements || []), ...IMPROVEMENTS])];
  event(m, 'mission_loop_seed', `Seeded ${made.length} long-run obligations`, { made: made.length });
  return response(m, { seeded: made, message: 'Long-run loop seeded; keep pulsing until all stop gates pass.' });
}
function pulse(m, input = {}) {
  const loop = ensure(m);
  loop.cycles += 1;
  const open = loop.queue.filter(item => item.status !== 'done' && item.status !== 'blocked');
  if (!open.length) replenish(loop, input);
  const next = choose(loop);
  if (next) {
    next.status = 'active';
    next.lastPickedAt = now();
    next.pickCount = (next.pickCount || 0) + 1;
  }
  const watch = watchdog(m, input);
  const pulseRecord = {
    id: id('pulse'),
    at: now(),
    cycle: loop.cycles,
    next,
    open: loop.queue.filter(item => item.status !== 'done').length,
    counts: counts(m),
    watchdog: watch
  };
  loop.pulses.unshift(pulseRecord);
  loop.pulses = loop.pulses.slice(0, 500);
  event(m, 'mission_loop_pulse', next?.title || 'No next item', { cycle: loop.cycles, nextId: next?.id || '' });
  return response(m, { pulse: pulseRecord, queue: loop.queue.slice(0, 20) });
}
function queue(m, input = {}) {
  const loop = ensure(m);
  const items = rawItems(input.add || input.items).map(item => queueItem(input.family || 'manual', item, input));
  loop.queue.unshift(...items);
  for (const item of items) addTask(m, item.title, { status: 'open', kind: 'long-run-manual' });
  event(m, 'mission_loop_queue', `Queued ${items.length} items`, { items: items.length });
  return response(m, { added: items, queue: loop.queue.slice(0, num(input.limit, 50)) });
}
function watchdog(m, input = {}) {
  const loop = ensure(m);
  const c = counts(m);
  const gates = {
    noOpenTasks: c.openTasks === 0,
    hasEvidence: c.evidence > 0,
    hasRecentPulse: (loop.pulses || []).length > 0,
    hasCheckpoint: (m.checkpoints || []).length > 0 || input.checkpoint === true,
    hasStepPlan: (m.stepPlans || []).length > 0,
    hasReview: (m.events || []).some(e => e.type === 'mission_step_review'),
    userDidNotStop: input.stop !== true && input.manualStop !== true
  };
  const missing = Object.entries(gates).filter(([, ok]) => !ok).map(([name]) => name);
  const record = { id: id('watch'), at: now(), gates, missing, recommendation: missing.length ? 'continue' : 'missionPostCompletion then final court' };
  loop.watchdog.unshift(record);
  loop.watchdog = loop.watchdog.slice(0, 500);
  return record;
}
function checkpointLoop(m, input = {}) {
  const loop = ensure(m);
  const cp = checkpoint(m, {
    ...input,
    kind: 'long-run',
    summary: input.summary || `Long-run cycle ${loop.cycles}; ${loop.queue.filter(x => x.status !== 'done').length} queued items remain.`,
    mail: input.mail === true
  });
  let mail = null;
  if (input.mail === true || input.selfMail === true) mail = selfMailDraft(m, { kind: 'long-run', checkpointId: cp.id, to: input.to || input.email || '' });
  return response(m, { checkpoint: cp, mail, queue: loop.queue.slice(0, 20) });
}
function response(m, extra = {}) {
  const loop = ensure(m);
  const nextPayload = nextActionPayload(m, extra);
  return {
    longRun: {
      id: loop.id,
      mode: loop.mode,
      cycles: loop.cycles,
      maxCycles: loop.maxCycles,
      queueOpen: loop.queue.filter(item => item.status !== 'done').length,
      familiesOpen: loop.families.filter(f => f.status !== 'done').length,
      stopGates: loop.stopGates,
      improvements: loop.improvements.slice(0, 20)
    },
    ...extra,
    next: nextPayload,
    mustCallNext: nextPayload,
    finalAnswerAllowed: false,
    mustContinue: true
  };
}
function nextActionPayload(m, extra = {}) {
  const next = extra.pulse?.next || choose(ensure(m));
  if (next) return { action: 'missionStepBrainstorm', missionId: m.id, stageTitle: next.title, step: next.step || undefined };
  return { action: 'missionLoopPulse', missionId: m.id, auto: true };
}
function queueItem(family, title, input = {}) {
  const source = title && typeof title === 'object' ? title : {};
  const itemFamily = source.family || family;
  const itemTitle = source.title || source.step || source.name || title;
  return {
    id: id('work'),
    family: String(itemFamily || 'manual'),
    title: String(itemTitle || `${itemFamily || family} work`),
    status: 'open',
    priority: num(source.priority ?? input.priority, priorityOf(itemFamily || family)),
    createdAt: now(),
    updatedAt: now(),
    why: source.why || input.why || `Keep mission improving through ${itemFamily || family} review.`,
    tests: arr(source.tests || input.tests),
    risks: arr(source.risks || input.risks)
  };
}
function priorityOf(family) {
  if (/evidence|tests|path-correlation|504/.test(family)) return 90;
  if (/implementation|api|compatibility|observability|recovery/.test(family)) return 80;
  if (/documentation|ux|research/.test(family)) return 60;
  return 50;
}
function choose(loop) {
  return loop.queue
    .filter(item => item.status !== 'done' && item.status !== 'blocked')
    .sort((a, b) => (b.priority - a.priority) || ((a.pickCount || 0) - (b.pickCount || 0)) || String(a.createdAt).localeCompare(String(b.createdAt)))[0] || null;
}
function replenish(loop, input = {}) {
  const families = LOOP_FAMILIES.slice(0, num(input.replenishFamilies, 8));
  loop.queue.push(...families.map(family => queueItem(family, `Re-check ${family} after apparent completion`, input)));
}

module.exports = { LOOP_FAMILIES, IMPROVEMENTS, ensure, seed, pulse, queue, watchdog, checkpointLoop };
