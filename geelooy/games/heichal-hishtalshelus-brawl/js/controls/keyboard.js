/**
 * B"H
 * Keyboard gates for sane desktop fighting.
 *
 * F is punch now, G is kick, H is grab, Shift blocks, R is special/recovery.
 * J/K/L still work as backwards compatibility, but the HUD teaches F/G/H.
 */
export function keyboard(doc) {
  const keys = new Set();
  doc.addEventListener('keydown', event => keys.add(event.code));
  doc.addEventListener('keyup', event => keys.delete(event.code));
  return () => ({
    x: axis(keys),
    jump: keys.has('Space') || keys.has('KeyW') || keys.has('ArrowUp'),
    punch: keys.has('KeyF') || keys.has('KeyJ'),
    kick: keys.has('KeyG') || keys.has('KeyK'),
    grab: keys.has('KeyH') || keys.has('KeyL'),
    shield: keys.has('ShiftLeft') || keys.has('ShiftRight'),
    special: keys.has('KeyR') || keys.has('KeyU')
  });
}

function axis(keys) {
  return (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) -
    (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
}
