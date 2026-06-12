// B"H
/** Chapter 342: The chamber senses the near-completion gate. */
let unbind = null;
export function bindCompletionState() {
  if (unbind) unbind();
  const root = document.querySelector('.post-reader-localized-context');
  if (!root) { unbind = () => {}; return unbind; }
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    root.classList.toggle('reader-near-complete', scrollY / max > .92);
  };
  update();
  addEventListener('scroll', update, { passive: true });
  unbind = () => removeEventListener('scroll', update);
  return unbind;
}
