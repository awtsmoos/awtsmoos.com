// B"H
export function bindBottomDock() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.home-command-dock a').forEach(link => {
    const href = new URL(link.href, location.origin).pathname.replace(/\/$/, '') || '/';
    if (href === path) link.setAttribute('aria-current', 'page');
  });
}
