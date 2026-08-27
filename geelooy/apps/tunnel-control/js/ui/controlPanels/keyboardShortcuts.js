// B"H

/**
 * B"H
 * Chapter 387: Keyboard Arrows Became A Quiet Compass.
 */
export function addKeyboardShortcuts() {
  if (window.__awtsmoosTabKeysMounted) return;
  window.__awtsmoosTabKeysMounted = true;

  window.addEventListener("keydown", event => {
    if (!event.altKey) return;

    const tabs = [...document.querySelectorAll("[data-tab]")];
    if (!tabs.length) return;

    const activeIndex = Math.max(0, tabs.findIndex(x => x.classList.contains("active")));

    if (event.key === "ArrowRight") {
      event.preventDefault();
      tabs[(activeIndex + 1) % tabs.length].click();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      tabs[(activeIndex - 1 + tabs.length) % tabs.length].click();
    }
  });
}
