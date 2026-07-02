// B"H
export default function createBreadcrumb({ state, controller }) {
  const root = document.createElement('nav');
  root.className = 'awtsmoos-breadcrumb';
  root.setAttribute('aria-label', 'Current folder breadcrumb');
  root.awtsUpdate = update; update(); return root;
  function update() {
    root.replaceChildren(); const crumbs = crumbList(state.currentPath || '/');
    crumbs.forEach((crumb, index) => {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'breadcrumb-segment xp-button'; button.textContent = crumb.label;
      button.title = crumb.path; button.disabled = index === crumbs.length - 1;
      button.onclick = () => controller.navigate(crumb.path);
      root.appendChild(button); if (index < crumbs.length - 1) root.appendChild(sep());
    });
  }
}
function crumbList(path = '/') {
  const value = String(path || '/'); if (value.startsWith('awtsmoos://')) return urlCrumbs(value);
  const parts = value.split('/').filter(Boolean); const out = [{ label:'Home', path:'/desktop.folder' }];
  if (!parts.length || value === '/desktop.folder') return out;
  let walk = ''; parts.forEach(part => { walk += `/${part}`; out.push({ label:label(part), path:walk }); }); return out;
}
function urlCrumbs(url) { const parts = url.replace('awtsmoos://', '').split('/').filter(Boolean); let walk = 'awtsmoos://'; return parts.map((part, i) => ({ label:i ? label(part) : part, path:(walk += `${part}/`).replace(/\/$/, '') })); }
function label(text = '') { return text.replace(/\.folder$/i, '').replace(/[-_]/g, ' ') || '/'; }
function sep() { const s = document.createElement('span'); s.className = 'breadcrumb-separator'; s.textContent = '›'; return s; }
/** B"H: every folder path becomes a visible ladder, not hidden state. */
