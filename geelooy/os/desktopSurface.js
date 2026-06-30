// B"H
export function renderDesktopSurface(os) {
  const desktop = os.getDesktop?.() || document.getElementById('desktop');
  if (!desktop) return null;
  desktop.querySelector('.awtsmoos-desktop-surface')?.remove();
  const surface = document.createElement('div');
  surface.className = 'awtsmoos-desktop-surface';
  icons(os).forEach(icon => surface.appendChild(iconNode(os, icon)));
  desktop.appendChild(surface);
  return surface;
}

function icons(os) {
  return [
    { title:'Desktop Files', icon:'🖥️', path:'desktop.folder', kind:'folder' },
    { title:'Awtsmoos Home', icon:'🏠', path:'/', kind:'folder' },
    { title:'Connected Tunnels', icon:'🔌', path:'awtsmoos://tunnels', kind:'remote' },
    { title:'Virtual OS Tunnel', icon:'☁️', path:'awtsmoos://tunnels/awtsmoos-virtual-os', kind:'remote' },
    { title:'Preview Artifacts', icon:'🔭', path:'awtsmoos://previews', kind:'remote' },
    { title:'Diagnostics', icon:'🧰', action:() => os.addWindow({ title:'Developer Diagnostics', os, programName:'awtsmoosDiagnostics' }), kind:'tool' }
  ];
}

function iconNode(os, item) {
  const button = document.createElement('button');
  button.className = `desktop-icon desktop-icon-${item.kind}`;
  button.dataset.path = item.path || '';
  button.innerHTML = `<span class="desktop-icon-glyph">${item.icon}</span><span class="desktop-icon-label">${escapeHtml(item.title)}</span>`;
  button.addEventListener('click', () => select(button));
  button.addEventListener('dblclick', () => open(os, item));
  button.addEventListener('keydown', e => { if (e.key === 'Enter') open(os, item); });
  return button;
}
function select(button) { button.parentElement?.querySelectorAll('.selected').forEach(el => el.classList.remove('selected')); button.classList.add('selected'); }
function open(os, item) { item.action ? item.action() : os.addWindow({ title:item.title, path:item.path, os, programName:'awtsmoosFileExplorer' }); }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }

/** B"H: the boot surface is a desktop again; icons are gates into mounted realities. */
