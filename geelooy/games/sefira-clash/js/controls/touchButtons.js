/**
 * B"H
 * Pointer-id based touch buttons for loyal long charges.
 *
 * Chapter 149: each button remembers the exact finger that began the charge.
 * Joystick movement, extra fingers, capture quirks, and unrelated touch events
 * cannot cancel punch or kick. Only the same finger lifting releases the stored
 * thunder.
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
    activePointer = event.pointerId;
    button.setPointerCapture?.(event.pointerId);
    state[action] = true;
    button.classList.add('held');
  };
  const off = event => {
    if (activePointer !== null && event.pointerId !== activePointer) return;
    event.preventDefault();
    event.stopPropagation();
    activePointer = null;
    state[action] = false;
    button.classList.remove('held');
  };
  button.addEventListener('pointerdown', on, { passive: false });
  button.addEventListener('pointerup', off, { passive: false });
  doc.addEventListener('pointerup', off, { passive: false });
  button.addEventListener('contextmenu', event => event.preventDefault(), { passive: false });
}
