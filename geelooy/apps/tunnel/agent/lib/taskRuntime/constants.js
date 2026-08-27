// B"H
const STATE_DIR = 'task-runtime-v1';
const MAX_TASKS = 1000;
const MAX_EVENTS = 300;
const OUTPUT_PAGE_CHARS = 12000;
const TASK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STATES = Object.freeze(['received','validated','scheduled','running','completed','failed','cancelled']);
module.exports = { STATE_DIR, MAX_TASKS, MAX_EVENTS, OUTPUT_PAGE_CHARS, TASK_TTL_MS, STATES };
