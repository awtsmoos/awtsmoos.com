
// B"H

function activateTab(tab) {
  const id = tab.dataset.tab;

  for (const one of document.querySelectorAll("[data-tab]")) {
    one.classList.toggle("active", one === tab);
    one.setAttribute("aria-selected", one === tab ? "true" : "false");
  }

  for (const pane of document.querySelectorAll("[data-pane]")) {
    const active = pane.dataset.pane === id;
    pane.classList.toggle("active", active);
    pane.hidden = !active;
  }

  try {
    localStorage.setItem("awtsmoos.activeTab", id);
  } catch (e) {}
}

export function mountTabs() {
  const tabs = [...document.querySelectorAll("[data-tab]")];

  for (const tab of tabs) {
    tab.setAttribute("role", "tab");
    tab.addEventListener("click", () => activateTab(tab));
  }

  for (const pane of document.querySelectorAll("[data-pane]")) {
    pane.setAttribute("role", "tabpanel");
  }

  let wanted = "";

  try {
    wanted = localStorage.getItem("awtsmoos.activeTab") || "";
  } catch (e) {}

  const first = tabs.find(x => x.dataset.tab === wanted) || tabs.find(x => x.classList.contains("active")) || tabs[0];

  if (first) activateTab(first);
}
