
// B"H

export function mountTabs() {
  for (const tab of document.querySelectorAll("[data-tab]")) {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;

      for (const one of document.querySelectorAll("[data-tab]")) {
        one.classList.toggle("active", one === tab);
      }

      for (const pane of document.querySelectorAll("[data-pane]")) {
        pane.classList.toggle("active", pane.dataset.pane === id);
      }
    });
  }
}
