// B"H

import { h } from "../ui/core/html.js";
import { PAGE_GROUPS } from "../shell/pageSpecs.js";

const PAGE_SIZE = 6;
const allGroup = "all";

/**
 * B"H
 * Chapter 15: The grid learned categories before movement.
 *
 * The Awtsmoos lets the operator narrow reality without scrolling through it.
 * Category tabs trim the card set, then pagination keeps the surface short.
 *
 * @param {HTMLButtonElement[]} cards Navigation cards.
 * @returns {HTMLElement} Paginated grid vessel.
 */
export function createPagedCardGrid(cards) {
  let page = 0;
  let group = allGroup;
  const grid = h("div", { classes: ["awt-dashboard-grid", "awt-feature-dashboard-grid"] });
  const status = h("span", { classes: ["awt-page-status"] });
  const prev = pageButton("Previous");
  const next = pageButton("Next");
  const tabs = groupTabs(cards, value => { group = value; page = 0; render(); });

  const render = () => {
    syncTabs(tabs, group);
    const filtered = group === allGroup ? cards : cards.filter(card => card.dataset.awtGroup === group);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    page = Math.min(Math.max(page, 0), pages - 1);
    grid.replaceChildren(...filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE));
    status.textContent = `${filtered.length} sections · page ${page + 1} of ${pages}`;
    prev.disabled = page === 0;
    next.disabled = page >= pages - 1;
  };

  prev.addEventListener("click", () => { page -= 1; render(); });
  next.addEventListener("click", () => { page += 1; render(); });
  render();
  return h("div", { classes: ["awt-paged-grid"], children: [tabs, grid, h("div", { classes: ["awt-page-controls"], children: [prev, status, next] })] });
}

/**
 * B"H
 * Builds category tabs from available cards.
 *
 * @param {HTMLElement[]} cards Cards.
 * @param {(group:string)=>void} onPick Picker.
 * @returns {HTMLElement} Tabs.
 */
function groupTabs(cards, onPick) {
  const groups = [allGroup, ...new Set(cards.map(card => card.dataset.awtGroup || "core"))];
  return h("div", { classes: ["awt-dashboard-tabs"], children: groups.map(group => tab(group, onPick)) });
}

/**
 * B"H
 * Makes one category tab.
 *
 * @param {string} group Group key.
 * @param {(group:string)=>void} onPick Picker.
 * @returns {HTMLButtonElement} Tab button.
 */
function tab(group, onPick) {
  const label = group === allGroup ? "All" : PAGE_GROUPS[group] || group;
  const button = h("button", { classes: ["awt-filter-tab"], attrs: { type: "button", "data-awt-filter": group }, text: label });
  button.addEventListener("click", () => onPick(group));
  return button;
}

/**
 * B"H
 * Syncs active tab styling.
 *
 * @param {HTMLElement} tabs Tabs root.
 * @param {string} group Active group.
 * @returns {void}
 */
function syncTabs(tabs, group) {
  for (const button of tabs.querySelectorAll("[data-awt-filter]")) {
    button.classList.toggle("active", button.dataset.awtFilter === group);
  }
}

/**
 * B"H
 * Makes one paging control.
 *
 * @param {string} label Button label.
 * @returns {HTMLButtonElement} Button.
 */
function pageButton(label) {
  return h("button", { classes: ["awt-page-button"], attrs: { type: "button" }, text: label });
}
