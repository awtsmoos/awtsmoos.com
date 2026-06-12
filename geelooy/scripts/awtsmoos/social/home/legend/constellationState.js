// B"H
/** Chapter 334: Discovery nodes glow when touched or focused. */
export function bindConstellationState(root = document) {
  const links = [...root.querySelectorAll('.home-discovery-card a')];
  links.forEach(link => {
    if (link.dataset.legendConstellationBound === 'true') return;
    link.dataset.legendConstellationBound = 'true';
    const on = () => link.dataset.legendState = 'awake';
    const off = () => link.dataset.legendState = 'resting';
    link.addEventListener('pointerenter', on);
    link.addEventListener('focus', on);
    link.addEventListener('pointerleave', off);
    link.addEventListener('blur', off);
  });
  return links;
}
