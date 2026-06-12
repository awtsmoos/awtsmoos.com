// B"H
/** Chapter 323: Home pointer light is optional and quiet. */
export function bindHomeAmbientPointer(root = document) {
  const shell = root.querySelector('.geelooy-home-shell');
  if (!shell || shell.dataset.awtsmoosPointerBound === 'true') return () => {};
  shell.dataset.awtsmoosPointerBound = 'true';
  const move = event => {
    shell.style.setProperty('--home-pointer-x', `${event.clientX}px`);
    shell.style.setProperty('--home-pointer-y', `${event.clientY}px`);
  };
  window.addEventListener('pointermove', move, { passive: true });
  return () => window.removeEventListener('pointermove', move);
}
