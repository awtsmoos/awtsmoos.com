// B"H

/**
 * B"H
 * Chapter 386: The Floating Map Found Panes Without Fragile Selectors.
 */
function paneForTab(tab) {
  return [...document.querySelectorAll("[data-pane]")]
    .find(pane => pane.dataset.pane === tab.dataset.tab);
}

export function makeFloatingMap() {
  const existing = document.querySelector(".awt-floating-map");
  if (existing) existing.remove();

  const tabs = [...document.querySelectorAll("[data-tab]")];
  if (!tabs.length) return;

  const nav = document.createElement("nav");
  nav.className = "awt-floating-map";

  const label = document.createElement("span");
  label.className = "awt-map-label";
  label.textContent = "Control Map";
  nav.appendChild(label);

  for (const tab of tabs) {
    const link = document.createElement("a");
    link.href = "#";
    link.className = "awt-map-link";
    link.textContent = tab.textContent.trim() || tab.dataset.tab || "Panel";

    link.addEventListener("click", event => {
      event.preventDefault();
      tab.click();
      paneForTab(tab)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    nav.appendChild(link);
  }

  const target = document.querySelector("main,.app,.container,body");
  target.insertBefore(nav, target.firstChild);
}
