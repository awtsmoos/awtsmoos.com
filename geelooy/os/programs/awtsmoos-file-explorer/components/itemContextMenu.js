// B"H
export function showExplorerItemMenu({ event, item, controller }) {
  event.preventDefault(); event.stopPropagation(); document.querySelector('.contextMenu')?.remove(); controller.clearSelection(); controller.select(item.path);
  const menu = document.createElement('div'); menu.className = 'contextMenu explorer-context-menu'; actions({ item, controller }).forEach(action => menu.appendChild(row(action, menu)));
  menu.style.left = `${event.pageX}px`; menu.style.top = `${event.pageY}px`; document.body.appendChild(menu); setTimeout(() => document.addEventListener('click', () => menu.remove(), { once:true }), 0);
}
function actions({ item, controller }) {
  const base = [{ label:'Open', run:() => controller.command.run('open') }];
  if (item.kind === 'folder') base.push({ label:'Open Shell Here', run:() => openShell(controller, item.path) });
  if (item.kind !== 'folder') base.push({ label:'Edit', run:() => controller.command.run('edit') }, { label:'Preview', run:() => controller.command.run('preview') });
  base.push({ label:'Copy Path', run:() => controller.command.run('copyPath') }, { label:'Copy', run:() => controller.command.run('copy') }, { label:'Cut', run:() => controller.command.run('cut') }, { label:'Rename', run:() => controller.command.run('rename') }, { label:'Delete', run:() => controller.command.run('delete') });
  if (controller.isRemote()) base.push({ label:'Remote permissions enforced', disabled:true }); return base;
}
function openShell(controller, path) { controller.os?.addWindow?.({ title:`Shell · ${path}`, path, cwd:path, currentPath:path, os:controller.os, programName:'awtsmoosCommand' }); }
function row(action, menu) { const el = document.createElement('div'); el.className = `menuItem${action.disabled ? ' disabled' : ''}`; el.textContent = action.label; el.dataset.action = action.label; el.onclick = async () => { if (action.disabled) return; menu.remove(); await action.run?.(); }; return el; }
/** B"H: every folder can open a shell in its own chamber. */
