// B"H
export function showExplorerItemMenu({ event, item, controller }) {
  event.preventDefault(); event.stopPropagation();
  document.querySelector('.contextMenu')?.remove();
  const menu = document.createElement('div');
  menu.className = 'contextMenu explorer-context-menu';
  actions({ item, controller }).forEach(action => menu.appendChild(row(action, menu)));
  menu.style.left = `${event.pageX}px`; menu.style.top = `${event.pageY}px`;
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', () => menu.remove(), { once:true }), 0);
}

function actions({ item, controller }) {
  const base = [{ label:'Open', run:() => controller.open(item) }];
  if (item.kind !== 'folder') base.push({ label:'Open in Code', run:() => controller.openInCode(item) });
  base.push({ label:'Copy Path', run:() => navigator.clipboard?.writeText(item.path) });
  if (controller.isRemote()) base.push({ label:'Remote Read Only', disabled:true });
  return base;
}
function row(action, menu) {
  const el = document.createElement('div');
  el.className = `menuItem${action.disabled ? ' disabled' : ''}`;
  el.textContent = action.label;
  el.onclick = async () => { if (action.disabled) return; menu.remove(); await action.run?.(); };
  return el;
}

/** B"H: right-click now opens a menu for every vessel, including remote read-only tunnels. */
