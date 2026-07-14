// B"H
import { shellRoutes } from './routes.js';
/** Reveals a shared drawer contract around existing menu buttons and sidebars. */
export function bindShellDrawer(root = document) {
  const button = root.getElementById?.('shared-menu-button') || root.querySelector('[data-geelooy-menu]');
  const drawer = root.getElementById?.('shared-sidebar') || createDrawer();
  if (!button || !drawer) return null;
  drawer.classList.add('geelooy-drawer');
  drawer.innerHTML ||= shellRoutes.map(route => `<a href="${route.href}">${route.icon} ${route.label}</a>`).join('');
  const setOpen = open => {
    document.body.dataset.geelooyDrawerOpen = open ? 'true' : 'false';
    drawer.classList.toggle('offscreen', !open);
    button.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', () => setOpen(drawer.classList.contains('offscreen')));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  document.addEventListener('pointerdown', event => closeFromOutside(event, drawer, button, setOpen), true);
  return { drawer, setOpen };
}
function createDrawer() {
  const drawer = document.createElement('nav');
  drawer.id = 'shared-sidebar';
  drawer.className = 'sidebarMitzvah offscreen';
  drawer.setAttribute('aria-label', 'Shared site menu');
  document.body.appendChild(drawer);
  return drawer;
}
function closeFromOutside(event, drawer, button, setOpen) {
  if (drawer.classList.contains('offscreen')) return;
  if (drawer.contains(event.target) || button.contains(event.target)) return;
  setOpen(false);
}
