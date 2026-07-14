// B"H
import { shellRoutes, currentRoute } from './routes.js';
/** Builds or harmonizes the persistent bottom dock without breaking no-JS links. */
export function ensureBottomDock(root = document) {
  const existing = root.querySelector('.home-command-dock, [data-geelooy-dock]');
  const dock = existing || document.createElement('nav');
  dock.className = `${existing?.className || 'home-command-dock'} geelooy-bottom-dock`.trim();
  dock.dataset.geelooyDock = 'true';
  dock.setAttribute('aria-label', 'Primary Geelooy routes');
  dock.innerHTML = shellRoutes.map(route => renderRoute(route)).join('');
  if (!existing) document.body.appendChild(dock);
  return dock;
}
function renderRoute(route) {
  const active = currentRoute().href === route.href;
  const create = route.create ? ' class="is-create"' : '';
  const current = active ? ' aria-current="page"' : '';
  return `<a href="${route.href}"${create}${current}><span>${route.icon}</span><strong>${route.label}</strong></a>`;
}
