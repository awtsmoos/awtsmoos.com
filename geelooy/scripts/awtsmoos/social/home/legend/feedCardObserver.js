// B"H
/** Chapter 333: The feed reveals the card nearest the center. */
let cleanup = null;
export function bindFeedCardObserver(root = document) {
  if (cleanup) cleanup();
  const cards = [...root.querySelectorAll('.home-post-card')];
  if (!cards.length) { cleanup = () => {}; return cleanup; }
  const update = () => {
    const center = innerHeight / 2;
    let best = null;
    let bestDistance = Infinity;
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      if (distance < bestDistance) { best = card; bestDistance = distance; }
    });
    cards.forEach(card => card.classList.toggle('is-feed-current', card === best));
  };
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  cleanup = () => { removeEventListener('scroll', update); removeEventListener('resize', update); };
  return cleanup;
}
