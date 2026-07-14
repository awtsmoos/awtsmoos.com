// B"H
/**
 * @module HomeMenu
 * @description
 * The menu is a tiny door in the Geelooy command ship. It opens without
 * layout thrash, closes on outside touch, and leaves focus where a human can
 * find it again. No mystery globals. No clipped mobile dropdown.
 */
document.querySelectorAll('[data-home-menu]').forEach(initMenu);

/** @param {HTMLElement} scope */
function initMenu(scope) {
  const button = scope.querySelector('.home-menu-button');
  const menu = scope.querySelector('#home-heichelos-menu,.home-heichelos-menu');
  if (!button || !menu) return;

  const close = restore => setOpen(scope, button, menu, false, restore);

  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(scope, button, menu, menu.hidden);
  });

  button.addEventListener('pointerup', event => event.stopPropagation());
  menu.addEventListener('click', event => { if (event.target.closest('a,button')) close(false); });
  document.addEventListener('pointerdown', event => {
    if (!scope.contains(event.target) && !menu.contains(event.target)) close(false);
  }, { passive: true });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
}

function setOpen(scope, button, menu, open, restore = false) {
  button.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  scope.toggleAttribute('data-open', open);
  document.documentElement.toggleAttribute('data-home-menu-open', open);
  if (open) requestAnimationFrame(() => firstFocusable(menu)?.focus({ preventScroll: true }));
  if (!open && restore) button.focus({ preventScroll: true });
}

function firstFocusable(menu) {
  return menu.querySelector('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
}
