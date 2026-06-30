// B"H
import { createCommandHistory } from './history.js';
import { createCommands } from './commands.js';
import { renderCommand, commandCss } from './renderer.js';
export default ({ os, path = '/', window } = {}) => {
  const root = document.createElement('div'); root.className = 'awts-command';
  ensureStyle(); const state = { cwd:path || '/' }; const history = createCommandHistory();
  let ui; const commands = createCommands({ os, state, history, render:() => ui.draw(), close:() => window?.close?.() });
  ui = renderCommand({ root, history, onSubmit:commands.run, complete:commands.complete });
  return { div:root, focus:ui.focus };
};
function ensureStyle() { if (document.getElementById('awts-command-style')) return; const style = document.createElement('style'); style.id = 'awts-command-style'; style.textContent = commandCss; document.head.appendChild(style); }
/** B"H: Command is now a safe VFS-backed voice, not a tunnel to native danger. */
