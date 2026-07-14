// B"H
import { activateFeedTab } from './feedTabs.js';
import { ensureFallbackFeed } from './feedSafeLoader.js';
export function bindMobileClickRepair() {
  document.addEventListener('click', routeCriticalClick, true);
  document.addEventListener('touchend', event => {
    const target = criticalTarget(event.target);
    if (!target) return;
    target.click?.();
  }, { passive: true });
  setTimeout(() => ensureFallbackFeed(document.querySelector('[data-home-feed]'), 'mobile-guardian-fallback'), 1600);
}
function routeCriticalClick(event) {
  const target = criticalTarget(event.target);
  if (!target) return;
  if (target.matches('#shared-menu-button,.menuBtn,[data-geelooy-menu]')) return toggleSharedMenu(target, event);
  if (target.matches('[data-feed-mode]')) return activateFeedTab(target);
  const link = target.closest?.('a[href]');
  if (!link) return;
  link.style.pointerEvents = 'auto';
}
function criticalTarget(node) {
  return node?.closest?.('#shared-menu-button,.menuBtn,[data-geelooy-menu],[data-feed-mode],.home-command-dock a,.home-empty-actions a,.geelooy-feed-compact-actions button,.geelooy-verse-chip');
}
function toggleSharedMenu(button, event) {
  const drawer = document.getElementById('shared-sidebar') || document.querySelector('.sidebarMitzvah');
  if (!drawer) return;
  event.preventDefault();
  event.stopPropagation();
  const open = drawer.classList.contains('offscreen') || drawer.hidden;
  drawer.hidden = false;
  drawer.classList.toggle('offscreen', !open);
  drawer.classList.add('geelooy-drawer');
  button.classList.toggle('is-open', open);
  button.setAttribute('aria-expanded', String(open));
  document.body.dataset.geelooyDrawerOpen = String(open);
  document.body.dataset.globalMenuOpen = 'false';
}
