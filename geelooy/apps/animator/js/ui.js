// B"H
/** Tiny task bus for legacy Vibe progress messages. */
export const UI = {
  startTask(id, label) { console.log(`B"H task start ${id}: ${label}`); },
  updateTask(id, percent, label) { console.log(`B"H task ${id}: ${Math.round(percent)}% ${label}`); },
  endTask(id, status, label) { console.log(`B"H task ${id} ${status}: ${label}`); }
};
