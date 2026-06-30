// B"H
import { createCommandHistory } from './history.js';
import { createCommands } from './commands.js';
import { renderCommand, commandCss } from './renderer.js';
export default ({ os, path = '/' } = {}) => {
  const root = document.createElement('div'); root.className = 'awts-command';
  if (!document.getElementById('awts-command-style')) { const style = document.createElement('style'); style.id = 'awts-command-style'; style.textContent = commandCss; document.head.appendChild(style); }
  const state = { cwd:path || '/' }; const history = createCommandHistory();
  let ui; const commands = createCommands({ os, state, history, render:() => ui.draw() });
  ui = renderCommand({ root, history, onSubmit:commands.run });
  return { div:root };
};
/** B"H: Command is not a shell of danger; it is a safe OS voice. */
