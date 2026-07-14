// B"H
export function bindSidebar() {
  const button = document.querySelector('[data-sidebar-toggle]');
  const panel = document.querySelector('[data-home-sidebar]');
  if (!button || !panel) return;
  const setOpen = open => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.dataset.sidebarOpen = open ? 'true' : 'false';
  };
  button.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setOpen(false);
  });
}
