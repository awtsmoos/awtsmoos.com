// B"H
/** Chapter 340: The center-most section receives the manuscript crown. */
let unbind = null;
export function bindCenterSectionObserver() {
  if (unbind) unbind();
  const chunks = [...document.querySelectorAll('#realPost .scroll-chunk')];
  if (!chunks.length) { unbind = () => {}; return unbind; }
  const update = () => {
    const center = innerHeight / 2;
    let best = null;
    let bestDistance = Infinity;
    chunks.forEach(chunk => {
      const rect = chunk.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      if (distance < bestDistance) { best = chunk; bestDistance = distance; }
    });
    chunks.forEach(chunk => chunk.classList.toggle('is-reader-center', chunk === best));
  };
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  unbind = () => { removeEventListener('scroll', update); removeEventListener('resize', update); };
  return unbind;
}
