// B"H
import { showInputDialog } from '../inputDialog.js';
export function createCommandRunner({ controller, state, onRefresh }) { return async def => { const payload = await payloadFor(def.action); await controller.command.run(def.action, payload || {}); onRefresh?.(); };
  function payloadFor(action) { if (action === 'newFile') return ask('Enter new file name', 'New File.txt'); if (action === 'newFolder') return ask('Enter new folder name', 'New Folder.folder'); if (action === 'filter') return { query:state.filter || '' }; return {}; }
}
function ask(title, fallback) { return new Promise(resolve => showInputDialog({ title, callback:name => resolve({ name:name || fallback }) })); }
/** B"H: button clicks become command invocations with prompts where needed. */
