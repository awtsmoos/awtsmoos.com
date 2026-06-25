// B"H
/**
 * GameplayBudgetScheduler
 * Due tasks are not a stampede. The scheduler caps work per tick, obeys the
 * selective realism governor, and gives the living world one tiny turn only
 * when there is budget to breathe.
 */
import { interestRing } from './InterestRings.js';
function activeBudget() {
  const realism = globalThis.__MITZVAH_WORLD_REALISM_BUDGET__ || {};
  return {
    ...(globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__ || {}),
    ...(globalThis.__AWTSMOOS_GAMEPLAY_BUDGET__ || {}),
    ...(realism.scheduler || {}),
    realism
  };
}
function taskHz(task, ring, budget) {
  if (typeof task.hz === 'function') return task.hz(ring, budget);
  if (task.hz != null) return task.hz;
  if (ring.name === 'near') return budget.realism?.ai?.fullHz || ring.hz;
  if (ring.name === 'mid') return Math.min(ring.hz, budget.realism?.animation?.farHz || ring.hz);
  return Math.min(ring.hz, budget.realism?.ai?.farHz || ring.hz);
}
function maybeStepLivingWorld(ran, cap, budget) {
  const living = globalThis.__MITZVAH_WORLD_LIVING_WORLD__;
  if (!living?.step || ran >= cap) return null;
  if (budget.realism?.level === 'rescue') return null;
  return living.step('gameplay-budget-spare-slot');
}
export function createGameplayBudgetScheduler({ now = () => performance.now(), player = () => ({ x:0, z:0 }), maxTasksPerTick = 3, maxMsPerTick = 1.8 } = {}) {
  const tasks = [];
  let cursor = 0;
  let lastLivingStep = null;
  return {
    add(task) { const row = { ...task, last:0, debt:0, ran:0 }; tasks.push(row); return row; },
    tick(time = now()) {
      const start = now(); let ran = 0; const b = activeBudget();
      const cap = Math.max(1, Math.min(maxTasksPerTick, Number(b.maxTasksPerTick || maxTasksPerTick)));
      const msCap = Math.max(.4, Math.min(maxMsPerTick, Number(b.maxMsPerTick || maxMsPerTick)));
      for (let scanned = 0; scanned < tasks.length && ran < cap; scanned += 1) {
        const task = tasks[cursor % Math.max(1, tasks.length)]; cursor += 1; if (!task) continue;
        const ring = interestRing(task.position?.() || {}, player()); const hz = taskHz(task, ring, b); if (!hz) continue;
        const every = 1000 / Math.max(.001, hz); if (time - task.last < every) continue;
        if (now() - start > msCap) { task.debt += 1; break; }
        task.last = time; task.debt = 0; task.ran += 1; task.run?.(ring, b); ran += 1;
      }
      if (now() - start <= msCap) lastLivingStep = maybeStepLivingWorld(ran, cap, b) || lastLivingStep;
      return ran;
    },
    report() { return { tasks:tasks.length, cursor, names:tasks.map(t => t.name), budget:activeBudget(), livingWorld:lastLivingStep, seal:'living-world-aware-gameplay-budget-scheduler-20260625-bh1' }; }
  };
}
export default createGameplayBudgetScheduler;
