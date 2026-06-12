// B"H
/** Chapter 315: The Heichel hero learns to bow as the reader descends. */
export function bindScrollHeroState(root = document) {
  const shell = root.querySelector('.heichel-mobile-navigation');
  if (!shell || shell.dataset.awtsmoosHeroStateBound === 'true') return () => {};
  shell.dataset.awtsmoosHeroStateBound = 'true';
  const update = () => shell.classList.toggle('hero-compact', window.scrollY > 120);
  update();
  window.addEventListener('scroll', update, { passive: true });
  return () => window.removeEventListener('scroll', update);
}
