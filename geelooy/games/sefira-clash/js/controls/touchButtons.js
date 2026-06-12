/**
 * B"H
 * Android pointer-id touch buttons.
 *
 * Chapter 52: every finger receives a covenant. Punch, kick, grab, shield, and
 * special can be held without joystick betrayal, and released without ghosts.
 */
export function touchButtons(doc, state) {
  doc.querySelectorAll('[data-act]').forEach(button => wireButton(doc, button, state));
}

function wireButton(doc, button, state) {
  const action = button.dataset.act;
  let activePointer = null;
  const on = event => {
    event.preventDefault();
    event.stopPropagation();
    if (activePointer !== null) return;
    activePointer = event.pointerId;
    button.setPointerCapture?.(event.pointerId);
    state[action] = true;
    button.classList.add('held');
  };
  const off = event => {
    if (activePointer !== null && event.pointerId !== activePointer) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    activePointer = null;
    state[action] = false;
    button.classList.remove('held');
  };
  button.addEventListener('pointerdown', on, { passive: false });
  button.addEventListener('pointerup', off, { passive: false });
  button.addEventListener('pointercancel', off, { passive: false });
  doc.addEventListener('pointerup', off, { passive: false });
  doc.addEventListener('pointercancel', off, { passive: false });
  button.addEventListener('contextmenu', event => event.preventDefault(), { passive: false });
}
