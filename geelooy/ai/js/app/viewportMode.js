//B"H
/**
 * @file viewportMode.js
 * @brief Names the vessel shape before CSS chooses its world.
 *
 * Chapter 8: The Awtsmoos found the fake phone crouching inside a desktop
 * chamber. This sentinel measures the visible world and writes one honest word
 * onto the body: phone, embedded, or desktop. CSS then stops guessing.
 */

const PHONE_MAX = 900;
const EMBEDDED_MAX_HEIGHT = 760;

/** B"H. Mounts viewport classification and keeps it alive. */
export function mountViewportMode() {
  const apply = () => classifyViewport();
  apply();
  window.addEventListener("resize", apply, { passive: true });
  window.addEventListener("orientationchange", apply, { passive: true });
}

function classifyViewport() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;
  const embedded = width > PHONE_MAX && height <= EMBEDDED_MAX_HEIGHT;
  const mode = width <= PHONE_MAX ? "phone" : embedded ? "embedded" : "desktop";
  document.body.dataset.viewportMode = mode;
  document.body.classList.toggle("is-ai-phone", mode === "phone");
  document.body.classList.toggle("is-ai-embedded", mode === "embedded");
  document.body.classList.toggle("is-ai-desktop", mode === "desktop");
}
