// B"H

import { h, field, area, out, $ } from "../ui/dom.js";
import { usage as readUsage } from "../api/control.js";
import { show } from "../ui/api.js";
import { ACTION_CATALOG } from "./actionCatalogData.js";

/**
 * B"H
 * Chapter 19: The raw furnace gained a lobby.
 *
 * The action page now begins as a searchable catalog. The detailed form, URL,
 * and result scrolls are hidden until an action is chosen and run.
 *
 * @returns {HTMLElement} Usage and action catalog pane.
 */
export function usage() {
  return h("section", { className: "pane", data: { pane: "usage" } }, [
    h("article", { className: "panel stack awt-action-catalog-panel" }, [
      h("div", { className: "awt-action-toolbar" }, [
        field("actionCatalogSearch", "Search actions", { placeholder: "list, tree, write, browser..." }),
        h("button", { id: "loadUsageBtn", text: "Load usage" })
      ]),
      h("div", { id: "actionCatalogGrid", className: "awt-action-catalog-grid" }, actionCards())
    ]),
    h("article", { id: "actionDetail", className: "panel stack awt-action-detail", hidden: true }, [
      h("div", { className: "awt-detail-head" }, [h("h3", { id: "actionDetailTitle", text: "Choose an action" }), h("span", { id: "actionDetailBadge", text: "Ready" })]),
      h("p", { id: "actionDetailDesc", className: "awt-muted-line", text: "Select an action card above." }),
      h("div", { className: "form-grid" }, [
        field("actionName", "Action", { value: "list", readOnly: true, className: "span-4" }),
        field("actionPath", "Path", { value: ".", className: "span-5" }),
        field("maxChars", "Max chars", { type: "number", value: "12000", className: "span-3" }),
        field("missionGoal", "Mission goal", { value: "Keep working until the mission is verified.", className: "span-6" }),
        field("missionId", "Mission id", { placeholder: "mission id from missionStart/report", className: "span-3" }),
        field("missionRounds", "Autopilot rounds", { type: "number", value: "8", min: "1", className: "span-3" }),
        field("selfEmail", "Self-mail recipient", { placeholder: "optional agent email", className: "span-6" }),
        area("missionAnswer", "Mission answer / checkpoint note", "D let tunnel choose next question forever"),
        area("writeContent", "Write content", ""),
        area("bulkPaths", "Bulk paths", ""),
        area("bulkWriteJson", "Bulk write JSON", "[]")
      ]),
      h("div", { className: "button-row" }, [h("button", { id: "runActionBtn", className: "primary", text: "Run action" }), h("button", { id: "copyActionUrlBtn", text: "Copy action URL" })])
    ]),
    outputDetails("Usage summary", "usageBox", "Usage not loaded yet."),
    outputDetails("Action URL", "actionUrlOut", "No action URL yet."),
    outputDetails("Action result", "actionOut", "No action response yet.")
  ]);
}

/**
 * B"H
 * Mounts usage loading and catalog filtering.
 *
 * @returns {void}
 */
export function mountUsage() {
  const button = $("loadUsageBtn");
  if (button) button.onclick = async () => { openDetails("usageBox"); $("usageBox").textContent = "Loading usage..."; show("usageBox", await readUsage()); };
  const search = $("actionCatalogSearch");
  if (search) search.addEventListener("input", filterCatalog);
}

/**
 * B"H
 * Builds action catalog buttons.
 *
 * @returns {HTMLElement[]} Cards.
 */
function actionCards() {
  return ACTION_CATALOG.map(item => h("button", { className: "awt-action-option", data: { action: item.name, search: `${item.name} ${item.title} ${item.group} ${item.desc}` }, attrs: { type: "button" } }, [
    h("strong", { text: item.title }), h("span", { text: item.desc }), h("small", { text: `${item.group} · ${(item.badges || []).join(" · ")}` })
  ]));
}

/**
 * B"H
 * Wraps output in collapsed details.
 *
 * @param {string} title Summary text.
 * @param {string} id Output id.
 * @param {string} text Initial text.
 * @returns {HTMLElement} Details node.
 */
function outputDetails(title, id, text) {
  return h("details", { className: "awt-output-details" }, [h("summary", { text: title }), out(id, text)]);
}

/**
 * B"H
 * Opens an output wrapper by contained id.
 *
 * @param {string} id Output id.
 * @returns {void}
 */
function openDetails(id) {
  $(id)?.closest("details")?.setAttribute("open", "open");
}

/**
 * B"H
 * Filters action cards.
 *
 * @returns {void}
 */
function filterCatalog() {
  const query = ($("actionCatalogSearch")?.value || "").toLowerCase();
  for (const card of document.querySelectorAll(".awt-action-option")) card.hidden = !card.dataset.search.toLowerCase().includes(query);
}
