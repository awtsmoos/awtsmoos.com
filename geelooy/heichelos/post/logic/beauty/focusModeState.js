// B"H
/** Chapter 319: Focus mode is a class, not a trap. */
export function bindFocusModeState() {
  const toggle = document.getElementById('focusModeToggle');
  const root = document.querySelector('.post-reader-localized-context');
  if (!toggle || !root || toggle.dataset.awtsmoosFocusBound === 'true') return () => {};
  toggle.dataset.awtsmoosFocusBound = 'true';
  const update = () => root.classList.toggle('reader-focus-active', Boolean(toggle.checked));
  toggle.addEventListener('change', update);
  update();
  return () => toggle.removeEventListener('change', update);
}
