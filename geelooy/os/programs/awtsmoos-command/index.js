// B"H
import { createCommandHistory } from './history.js';
import { createCommands } from './commands.js';
import { renderCommand, commandCss } from './renderer.js';
export default ({ os, path = '/', cwd, currentPath, window } = {}) => {
  const root = document.createElement('div'); root.className = 'awts-command';
  ensureStyle(); const state = { cwd:cwd || currentPath || path || '/' }; const history = createCommandHistory();
  let ui; const commands = createCommands({ os, state, history, render:() => ui.draw(), close:() => window?.close?.() });
  ui = renderCommand({ root, history, onSubmit:commands.run, complete:commands.complete });
  history.push(`Awtsmoos shell opened at ${state.cwd}`);
  return { div:root, focus:ui.focus };
};
function ensureStyle() { if (document.getElementById('awts-command-style')) return; const style = document.createElement('style'); style.id = 'awts-command-style'; style.textContent = commandCss; document.head.appendChild(style); }
/** B"H: Command now honors the directory that summoned it. */
