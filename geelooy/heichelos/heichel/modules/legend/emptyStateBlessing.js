// B"H
/** Chapter 338: Empty grids receive a visible blessing class. */
export function blessEmptyStates(root = document) {
  const grids = [...root.querySelectorAll('.dynamic-grid')];
  grids.forEach(grid => {
    const hasRealContent = [...grid.children].some(child => child.offsetParent !== null || child.children.length);
    grid.classList.toggle('legend-empty-grid', !hasRealContent);
  });
  return grids.length;
}
