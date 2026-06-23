// B"H
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { dir, event, addTask } = require('./core.js');

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
function obj(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return {};
}
function boolTrue(v) { return v === undefined || v === true || v === 'true' || v === 1 || v === '1'; }
function stepLetter(input = {}, m = {}) {
  return String(input.step || input.letter || nextLetter(m) || 'A').trim().slice(0, 4).toUpperCase();
}
function nextLetter(m = {}) {
  const count = (m.stepPlans || []).length;
  const code = 'A'.charCodeAt(0) + count;
  return code <= 'Z'.charCodeAt(0) ? String.fromCharCode(code) : `S${count + 1}`;
}
function ensure(m) {
  m.stepPlans ||= [];
  m.chunkPlans ||= [];
  m.refrigeratedStates ||= [];
  m.thawHistory ||= [];
  m.nextPlans ||= [];
  return m;
}
function latestPlan(m, input = {}) {
  ensure(m);
  const wanted = input.step ? String(input.step).toUpperCase() : '';
  const plans = wanted ? m.stepPlans.filter(p => p.step === wanted) : m.stepPlans;
  return plans[plans.length - 1] || null;
}
function normalizeChunk(input = {}, chunk = {}, index = 0) {
  const filesToTouch = arr(chunk.filesToTouch || chunk.files || input.filesToTouch || input.files || input.path);
  const whyEachFile = obj(chunk.whyEachFile || input.whyEachFile);
  const title = String(chunk.title || input.chunkTitle || input.stageTitle || `Chunk ${index + 1}`);
  const readBeforeWrite = boolTrue(chunk.readBeforeWrite ?? input.readBeforeWrite);
  const fullRewriteRequired = boolTrue(chunk.fullRewriteRequired ?? input.fullRewriteRequired);
  return {
    id: chunk.id || id('chunk'),
    title,
    filesToTouch,
    whyEachFile,
    readBeforeWrite,
    fullRewriteRequired,
    tests: arr(chunk.tests || input.tests),
    risks: arr(chunk.risks || input.risks),
    status: chunk.status || 'planned',
    createdAt: chunk.createdAt || now(),
    updatedAt: now()
  };
}
function makePlan(m, input = {}) {
  ensure(m);
  const plan = {
    id: input.id || id('step'),
    missionId: m.id,
    step: stepLetter(input, m),
    stageTitle: String(input.stageTitle || input.title || `Step ${stepLetter(input, m)}`),
    brainstorm: arr(input.brainstorm || input.questions),
    plan: arr(input.plan || input.planned || input.items),
    chunks: [],
    planned: arr(input.planned || input.plan || input.items),
    actual: arr(input.actual),
    delta: arr(input.delta),
    createdAt: now(),
    updatedAt: now()
  };
  m.stepPlans.push(plan);
  event(m, 'mission_step_plan_created', plan.stageTitle, { stepPlanId: plan.id, step: plan.step });
  return plan;
}
function brainstorm(m, input = {}) {
  const plan = makePlan(m, {
    ...input,
    brainstorm: arr(input.brainstorm).length ? input.brainstorm : [
      'What assumptions does this step make?',
      'What evidence would prove or disprove this step?',
      'Which exact files or chunks might change?',
      'What must be read before any write?',
      'What tests or checks should follow this chunk?',
      'What should be checkpointed if context is lost?'
    ],
    plan: arr(input.plan)
  });
  return {
    stepPlan: plan,
    next: { action: 'missionStepPlan', missionId: m.id, step: plan.step },
    mustCallNext: { action: 'missionStepPlan', missionId: m.id, step: plan.step }
  };
}
function stepPlan(m, input = {}) {
  const plan = latestPlan(m, input) || makePlan(m, input);
  if (input.step || input.letter) plan.step = stepLetter(input, m);
  plan.stageTitle = String(input.stageTitle || input.title || plan.stageTitle || `Step ${plan.step}`);
  plan.plan = arr(input.plan || input.planned || input.items);
  plan.planned = arr(input.planned || input.plan || input.items);
  plan.updatedAt = now();
  event(m, 'mission_step_plan_recorded', plan.stageTitle, { stepPlanId: plan.id, step: plan.step });
  return {
    stepPlan: plan,
    next: { action: 'missionFilesToTouch', missionId: m.id, step: plan.step },
    mustCallNext: { action: 'missionFilesToTouch', missionId: m.id, step: plan.step }
  };
}
function filesToTouch(m, input = {}) {
  const plan = latestPlan(m, input) || makePlan(m, input);
  const chunk = normalizeChunk(input, {}, plan.chunks.length);
  chunk.status = 'planned';
  plan.chunks.push(chunk);
  plan.updatedAt = now();
  m.chunkPlans.push({ stepPlanId: plan.id, step: plan.step, ...chunk });
  event(m, 'mission_files_to_touch_recorded', chunk.title, { stepPlanId: plan.id, chunkId: chunk.id, filesToTouch: chunk.filesToTouch });
  return {
    stepPlan: plan,
    chunk,
    gate: { readBeforeWrite: true, fullRewriteRequired: true },
    next: { action: 'missionStepExecute', missionId: m.id, step: plan.step, chunkId: chunk.id },
    mustCallNext: { action: 'missionStepExecute', missionId: m.id, step: plan.step, chunkId: chunk.id }
  };
}
function chunkPlan(m, input = {}) {
  const plan = latestPlan(m, input) || makePlan(m, input);
  const chunksInput = Array.isArray(input.chunks) ? input.chunks : (() => { try { return JSON.parse(input.chunks || '[]'); } catch { return []; } })();
  const chunks = (chunksInput.length ? chunksInput : [{}]).map((chunk, i) => normalizeChunk(input, chunk, plan.chunks.length + i));
  for (const chunk of chunks) {
    plan.chunks.push(chunk);
    m.chunkPlans.push({ stepPlanId: plan.id, step: plan.step, ...chunk });
  }
  plan.updatedAt = now();
  event(m, 'mission_chunk_plan_recorded', plan.stageTitle, { stepPlanId: plan.id, chunks: chunks.length });
  return {
    stepPlan: plan,
    chunks,
    gate: { readBeforeWrite: true, fullRewriteRequired: true },
    next: { action: 'missionStepExecute', missionId: m.id, step: plan.step, chunkId: chunks[0]?.id || '' },
    mustCallNext: { action: 'missionStepExecute', missionId: m.id, step: plan.step, chunkId: chunks[0]?.id || '' }
  };
}
function execute(m, input = {}) {
  const plan = latestPlan(m, input) || makePlan(m, input);
  const chunk = (plan.chunks || []).find(c => c.id === input.chunkId) || plan.chunks?.[0] || null;
  if (chunk) { chunk.status = 'active'; chunk.updatedAt = now(); }
  event(m, 'mission_step_execute_gate', plan.stageTitle, { stepPlanId: plan.id, chunkId: chunk?.id || '' });
  return {
    stepPlan: plan,
    chunk,
    instructions: [
      'Read every listed file/chunk before writing.',
      'Use full-file rewrites for files that are edited.',
      'Run the listed tests or the closest available checks.',
      'Call missionStepReview with planned and actual evidence after execution.'
    ],
    next: { action: 'missionStepReview', missionId: m.id, step: plan.step, chunkId: chunk?.id || '' },
    mustCallNext: { action: 'missionStepReview', missionId: m.id, step: plan.step, chunkId: chunk?.id || '' }
  };
}
function review(m, input = {}) {
  const plan = latestPlan(m, input) || makePlan(m, input);
  const actual = arr(input.actual || input.filesTouched || input.touchedFiles);
  const tests = arr(input.testsRun || input.tests);
  const evidence = arr(input.evidence);
  plan.actual = actual;
  const plannedFiles = (plan.chunks || []).flatMap(c => c.filesToTouch || []);
  const missingFiles = plannedFiles.filter(f => !actual.includes(f));
  const missingReads = boolTrue(input.readBeforeWrite) ? [] : plannedFiles;
  const missingRewrites = boolTrue(input.fullRewriteRequired) ? [] : actual;
  const missingTests = tests.length ? [] : (plan.chunks || []).flatMap(c => c.tests || []).filter(Boolean);
  const missing = [...missingFiles.map(x => `file not touched: ${x}`), ...missingReads.map(x => `read missing: ${x}`), ...missingRewrites.map(x => `full rewrite missing: ${x}`), ...missingTests.map(x => `test missing: ${x}`)];
  plan.delta = missing;
  for (const chunk of plan.chunks || []) chunk.status = missing.length ? 'reviewing' : 'done';
  plan.updatedAt = now();
  event(m, 'mission_step_review', missing.length ? 'missing work found' : 'step reviewed cleanly', { stepPlanId: plan.id, missing });
  return {
    stepPlan: plan,
    review: { plannedFiles, actual, tests, evidence, missingFiles, missingReads, missingRewrites, missingTests, missing },
    next: { action: missing.length ? 'missionStepDelta' : 'missionExpand', missionId: m.id, step: plan.step },
    mustCallNext: { action: missing.length ? 'missionStepDelta' : 'missionExpand', missionId: m.id, step: plan.step }
  };
}
function delta(m, input = {}) {
  const plan = latestPlan(m, input) || makePlan(m, input);
  const missing = arr(input.delta || input.missing || plan.delta);
  plan.delta = missing;
  for (const item of missing) addTask(m, `Step ${plan.step} missing work: ${item}`, { status: 'open' });
  event(m, 'mission_step_delta', `Step ${plan.step} delta`, { stepPlanId: plan.id, missing });
  return {
    stepPlan: plan,
    missing,
    next: { action: 'missionNextPlan', missionId: m.id, step: plan.step },
    mustCallNext: { action: 'missionNextPlan', missionId: m.id, step: plan.step }
  };
}
async function refrigerate(config, m, input = {}) {
  const plan = latestPlan(m, input);
  const state = {
    id: input.id || id('refrigerated'),
    missionId: m.id,
    step: input.step || plan?.step || '',
    currentChunk: input.chunkId || '',
    planned: arr(input.planned || plan?.planned),
    actual: arr(input.actual || plan?.actual),
    filesTouched: arr(input.filesTouched || input.actual),
    pendingNextAction: input.pendingNextAction || input.nextAction || 'missionThaw',
    risks: arr(input.risks),
    resumeInstruction: input.resumeInstruction || `Call missionThaw with missionId=${m.id}, then call the returned mustCallNext action.`,
    createdAt: now()
  };
  ensure(m);
  m.refrigeratedStates.push(state);
  const missionDir = dir(config, m.id);
  await fsp.mkdir(missionDir, { recursive: true });
  await fsp.writeFile(path.join(missionDir, `${state.id}.json`), JSON.stringify(state, null, 2), 'utf8');
  event(m, 'mission_refrigerated', state.resumeInstruction, { stateId: state.id });
  return { state, next: { action: 'missionThaw', missionId: m.id }, mustCallNext: { action: 'missionThaw', missionId: m.id } };
}
function thaw(m, input = {}) {
  ensure(m);
  const state = input.stateId ? m.refrigeratedStates.find(s => s.id === input.stateId) : m.refrigeratedStates[m.refrigeratedStates.length - 1];
  const thawed = { id: id('thaw'), missionId: m.id, stateId: state?.id || '', at: now(), nextAction: state?.pendingNextAction || 'missionNextPlan' };
  m.thawHistory.push(thawed);
  event(m, 'mission_thawed', thawed.nextAction, { stateId: thawed.stateId });
  return { state, thawed, next: { action: thawed.nextAction, missionId: m.id, step: state?.step || '' }, mustCallNext: { action: thawed.nextAction, missionId: m.id, step: state?.step || '' } };
}
function nextPlan(m, input = {}) {
  const plan = makePlan(m, {
    step: input.nextStep || nextLetter(m),
    stageTitle: input.stageTitle || 'Next improvement plan',
    brainstorm: [
      'What did the last step reveal?',
      'Which tests, docs, reviews, risks, or automation remain?',
      'What is the next smallest safe chunk?'
    ],
    plan: arr(input.plan).length ? input.plan : ['Review latest deltas', 'Choose next safe chunk', 'Record files/chunks before execution']
  });
  m.nextPlans.push(plan);
  event(m, 'mission_next_plan', plan.stageTitle, { stepPlanId: plan.id, step: plan.step });
  return { stepPlan: plan, next: { action: 'missionStepBrainstorm', missionId: m.id, step: plan.step }, mustCallNext: { action: 'missionStepBrainstorm', missionId: m.id, step: plan.step } };
}

module.exports = { ensure, brainstorm, stepPlan, filesToTouch, chunkPlan, execute, review, delta, refrigerate, thaw, nextPlan };
