// B"H
/**
 * @file SimulationScheduler.js
 * @description Work is sliced like challah: each frame receives only its measured portion.
 */
export function createSimulationScheduler(maxTasksPerStep = 12) {
  return { version: "simulation-scheduler-v1", maxTasksPerStep, cursor: 0, tasks: [] };
}

export function scheduleTask(scheduler, name, tier = 3, weight = 1) {
  return { ...scheduler, tasks: [...scheduler.tasks, { name, tier, weight: Math.max(1, weight | 0) }] };
}

export function stepSimulationScheduler(scheduler) {
  const tasks = scheduler.tasks || [];
  if (!tasks.length) return { scheduler, ran: [] };
  const ran = [];
  let cursor = scheduler.cursor || 0;
  for (let i = 0; i < scheduler.maxTasksPerStep && i < tasks.length; i++) {
    ran.push(tasks[cursor % tasks.length]);
    cursor++;
  }
  return { scheduler: { ...scheduler, cursor }, ran };
}

export function schedulerSummary(scheduler) {
  return { tasks: scheduler.tasks?.length || 0, maxTasksPerStep: scheduler.maxTasksPerStep, cursor: scheduler.cursor || 0 };
}
