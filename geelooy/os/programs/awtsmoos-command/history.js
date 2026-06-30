// B"H
const KEY = 'awtsmoos-command-history-v2';
export function createCommandHistory({ limit = 600 } = {}) {
  const lines = ['Awtsmoos Command online. Type help.'];
  const commands = load();
  function push(text = '') { lines.push(String(text)); trim(lines, limit); }
  function record(input = '') { const value = String(input).trim(); if (!value) return; commands.push(value); trim(commands, 120); save(commands); }
  return { push, record, clear:() => lines.splice(0), lines:() => [...lines], commands:() => [...commands] };
}
function trim(list, limit) { while (list.length > limit) list.shift(); }
function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function save(commands) { try { localStorage.setItem(KEY, JSON.stringify(commands)); } catch {} }
/**
 * B"H
 * The shell remembers without becoming a prison: every typed spark is saved in
 * the browser vessel, while output remains a flowing river that can be cleared.
 */
