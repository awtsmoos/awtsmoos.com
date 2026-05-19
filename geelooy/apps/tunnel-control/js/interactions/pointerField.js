// B"H

/**
 * B"H
 * Lets the screen feel the user's pointer as a quiet field.
 *
 * @returns {void}
 */
export function mountPointerField() {
  window.addEventListener("pointermove", event => {
    const x = `${Math.round((event.clientX / window.innerWidth) * 100)}%`;
    const y = `${Math.round((event.clientY / window.innerHeight) * 100)}%`;
    document.documentElement.style.setProperty("--awt-pointer-x", x);
    document.documentElement.style.setProperty("--awt-pointer-y", y);
  }, { passive: true });
}
