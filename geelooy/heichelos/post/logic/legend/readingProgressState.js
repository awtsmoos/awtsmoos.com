// B"H
/** Chapter 341: The root learns the reader progress ratio. */
let unbind = null;
export function bindReadingProgressState() {
  if (unbind) unbind();
  const root = document.querySelector('.post-reader-localized-context') || document.documentElement;
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const ratio = Math.max(0, Math.min(1, scrollY / max));
    root.style.setProperty('--reader-progress', String(ratio));
  };
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  unbind = () => { removeEventListener('scroll', update); removeEventListener('resize', update); };
  return unbind;
}
