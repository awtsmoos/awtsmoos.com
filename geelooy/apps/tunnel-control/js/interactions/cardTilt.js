// B"H

/**
 * B"H
 * Gives dashboard cards a restrained magnetic tilt.
 *
 * @param {HTMLElement} card Card element.
 * @returns {void}
 */
function bindTilt(card) {
  card.addEventListener("pointermove", event => {
    const box = card.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    card.style.setProperty("--ry", `${(px - .5) * 10}deg`);
    card.style.setProperty("--rx", `${(.5 - py) * 8}deg`);
    card.style.setProperty("--shine-x", `${Math.round(px * 100)}%`);
    card.style.setProperty("--shine-y", `${Math.round(py * 100)}%`);
  }, { passive: true });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });
}

/**
 * B"H
 * Mounts tilt behavior for all present and future action cards.
 *
 * @returns {void}
 */
export function mountCardTilt() {
  document.querySelectorAll(".awt-action-card").forEach(bindTilt);
}
