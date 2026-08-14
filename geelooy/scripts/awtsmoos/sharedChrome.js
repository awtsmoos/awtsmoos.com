// B"H
(() => {
  const closeAll = () => {
    document.querySelectorAll('.sidebarMitzvah').forEach(sidebar => sidebar.classList.add('offscreen'));
    document.querySelectorAll('.menuBtn').forEach(button => {
      button.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    });
  };

  const bindButton = button => {
    if (button.dataset.sharedChromeBound === 'true') return;
    button.dataset.sharedChromeBound = 'true';
    const targetId = button.getAttribute('aria-controls');
    const sidebar = targetId ? document.getElementById(targetId) : document.querySelector('.sidebarMitzvah');
    if (!sidebar) return;
    button.addEventListener('click', event => {
      event.preventDefault();
      const willOpen = sidebar.classList.contains('offscreen');
      closeAll();
      sidebar.classList.toggle('offscreen', !willOpen);
      button.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  };

  const bindChrome = () => {
    document.querySelectorAll('.menuBtn').forEach(bindButton);
  };

  document.addEventListener('click', event => {
    if (event.target.closest('.menuBtn, .sidebarMitzvah')) return;
    closeAll();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAll();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindChrome);
  else bindChrome();
})();
