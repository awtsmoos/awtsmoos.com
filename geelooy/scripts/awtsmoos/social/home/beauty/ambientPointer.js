// B"H
/**
 * @file ambientPointer.js
 * @description
 * Chapter 323 rewritten: the Home light follows only inside its own sanctuary.
 * The Awtsmoos shines through the pointer, but the whole window must not carry
 * a listener for a local decorative glow. This vessel binds once, cleans once,
 * and leaves native scroll untouched.
 */

let cleanup = null;

function writePointer(shell, event) {
  shell.style.setProperty('--home-pointer-x', `${event.clientX}px`);
  shell.style.setProperty('--home-pointer-y', `${event.clientY}px`);
}

/**
 * Bind the optional Home ambient pointer glow to the Home shell only.
 * @param {ParentNode} root
 * @returns {Function} cleanup function
 */
export function bindHomeAmbientPointer(root = document) {
  if (cleanup) return cleanup;

  const shell = root.querySelector('.geelooy-home-shell');
  if (!shell) return () => {};

  const move = event => writePointer(shell, event);
  const leave = () => {
    shell.style.removeProperty('--home-pointer-x');
    shell.style.removeProperty('--home-pointer-y');
  };

  shell.dataset.awtsmoosPointerBound = 'true';
  shell.addEventListener('pointermove', move, { passive: true });
  shell.addEventListener('pointerleave', leave, { passive: true });

  cleanup = () => {
    shell.removeEventListener('pointermove', move);
    shell.removeEventListener('pointerleave', leave);
    delete shell.dataset.awtsmoosPointerBound;
    cleanup = null;
  };

  return cleanup;
}
