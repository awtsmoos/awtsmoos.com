// B"H
/**
 * @module ProfileTabs
 * @description
 * Chapter 25: The Awtsmoos turns profile tabs into honest keyboard vessels.
 * Buttons expose selected state and panels expose hidden state.
 */
import { all } from "./dom.js";

function activateTab(button) {
  const target = button.dataset.profileTab;
  all("[data-profile-tab]").forEach(tab => {
    const active = tab === button;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.setAttribute("tabindex", active ? "0" : "-1");
  });
  all("[data-profile-panel]").forEach(panel => {
    const active = panel.dataset.profilePanel === target;
    panel.classList.toggle("hidden", !active);
    panel.hidden = !active;
  });
}

export function bindTabs() {
  const tabs = all("[data-profile-tab]");
  tabs.forEach(button => {
    button.addEventListener("click", () => activateTab(button));
    button.addEventListener("keydown", event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.indexOf(button);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      activateTab(tabs[next]);
    });
  });
}
