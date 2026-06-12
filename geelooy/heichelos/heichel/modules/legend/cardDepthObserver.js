// B"H
/** Chapter 336: Cards nearest the viewport center receive depth. */
let unbind = null;
export function bindCardDepthObserver(root = document) {
  if (unbind) unbind();
  const cards = [...root.querySelectorAll('.nav-card')];
  if (!cards.length) { unbind = () => {}; return unbind; }
  const update = () => {
    const center = innerHeight / 2;
    let best = null;
    let bestDistance = Infinity;
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      if (distance < bestDistance) { best = card; bestDistance = distance; }
    });
    cards.forEach(card => card.classList.toggle('is-card-current', card === best));
  };
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  unbind = () => { removeEventListener('scroll', update); removeEventListener('resize', update); };
  return unbind;
}
