// B"H
/** Chapter 345: Inline anchors may highlight their vessel without breaking. */
export function bindInlineAnchorState(root = document) {
  const anchors = [...root.querySelectorAll('.inline-comment-anchor')];
  anchors.forEach(anchor => {
    if (anchor.dataset.legendInlineBound === 'true') return;
    anchor.dataset.legendInlineBound = 'true';
    anchor.addEventListener('pointerenter', () => anchor.classList.add('legend-inline-awake'));
    anchor.addEventListener('pointerleave', () => anchor.classList.remove('legend-inline-awake'));
  });
  return anchors.length;
}
