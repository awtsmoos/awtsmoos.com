// B"H
/** Chapter 337: The hero depth state receives finer thresholds. */
let unbind = null;
export function bindHeroScrollDepth(root = document) {
  if (unbind) unbind();
  const shell = root.querySelector('.heichel-mobile-navigation');
  if (!shell) { unbind = () => {}; return unbind; }
  const update = () => {
    shell.dataset.legendHeroDepth = scrollY > 240 ? 'deep' : scrollY > 96 ? 'middle' : 'open';
  };
  update();
  addEventListener('scroll', update, { passive: true });
  unbind = () => removeEventListener('scroll', update);
  return unbind;
}
