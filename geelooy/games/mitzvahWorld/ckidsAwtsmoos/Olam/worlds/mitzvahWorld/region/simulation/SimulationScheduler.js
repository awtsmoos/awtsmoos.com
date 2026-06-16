// B"H
/** @file SimulationScheduler.js @description Work is sliced like challah: each frame receives a measured portion. */
export function createSimulationScheduler(maxTasksPerStep = 12) { return { version:"simulation-scheduler-v2-parser-clear", maxTasksPerStep, cursor:0, tasks:[] }; }
export function scheduleTask(scheduler, name, tier = 3, weight = 1) { return Object.assign({}, scheduler, { tasks:[...scheduler.tasks, { name, tier, weight:Math.max(1, weight | 0) }] }); }
export function stepSimulationScheduler(scheduler) { const tasks = scheduler.tasks || []; if (!tasks.length) return { scheduler, ran:[] }; const ran = []; let cursor = scheduler.cursor || 0; for (let i=0; i<scheduler.maxTasksPerStep && i<tasks.length; i++) { ran.push(tasks[cursor % tasks.length]); cursor++; } return { scheduler:Object.assign({}, scheduler, { cursor }), ran }; }
export function schedulerSummary(scheduler) { const tasks = scheduler && Array.isArray(scheduler.tasks) ? scheduler.tasks : []; return { tasks:tasks.length, maxTasksPerStep:scheduler.maxTasksPerStep, cursor:scheduler.cursor || 0 }; }
