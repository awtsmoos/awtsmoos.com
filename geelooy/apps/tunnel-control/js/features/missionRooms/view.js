// B"H

import { h, out } from "../../ui/dom.js";
import { DEFAULT_AGENT } from "./state.js";

/**
 * B"H
 * Chapter 703: The room body split from the room mind.
 *
 * This file builds the chamber only. No polling, no storage, no hidden action;
 * just vessels waiting for the living controller to fill them with breath.
 */
export function createMissionRoomsView() {
  return h("section", { className: "pane awt-room-console", data: { pane: "missionRooms" } }, [
    head(), controls(), layout(), h("article", { className: "panel stack" }, [
      h("h3", { text: "Room JSON" }),
      out("roomOut", "No room loaded.")
    ])
  ]);
}

function head() {
  return h("div", { className: "page-head" }, [
    h("p", { className: "eyebrow", text: "ROOMS" }),
    h("h2", { text: "Mission rooms" }),
    h("p", { text: "All known rooms load automatically as cards. Rejoin, heartbeat, chat, block, continue, and audit coordination stay inside the selected room." })
  ]);
}

function controls() {
  return h("article", { className: "panel stack" }, [
    h("div", { className: "form-grid" }, [
      label("Optional project root filter", h("input", { id: "roomProjectRoot", placeholder: "/Users/.../project or keyword" })),
      label("Agent id", h("input", { id: "roomAgentId", value: DEFAULT_AGENT })),
      label("Poll ms", h("input", { id: "roomPollMs", type: "number", min: "1500", value: "5000" }))
    ]),
    h("div", { className: "button-row" }, [
      button("discoverRoomsBtn", "Discover", "primary"),
      button("refreshRoomBtn", "Refresh room"),
      button("copyRoomLinkBtn", "Copy room link")
    ]),
    h("div", { id: "roomStatus", className: "notice", text: "Loading all known mission rooms automatically." })
  ]);
}

function layout() {
  return h("article", { className: "awt-room-layout" }, [
    h("aside", { id: "roomList", className: "panel awt-room-list awt-room-card-grid" }),
    h("section", { className: "panel stack awt-room-main" }, [
      h("div", { id: "roomHeader", className: "awt-room-header", text: "No room selected." }),
      h("div", { id: "roomMetrics", className: "awt-room-metrics" }),
      h("div", { id: "roomMessages", className: "awt-room-messages" }),
      composer()
    ])
  ]);
}

function composer() {
  return h("div", { className: "stack" }, [
    label("Message to room", h("textarea", { id: "roomMessage", placeholder: "Tell agents what changed. Use 'continue' or 'go on' to let them proceed." })),
    h("div", { className: "button-row" }, [
      label("Block agents until response", h("input", { id: "roomBlockAgents", type: "checkbox", checked: true })),
      button("sendRoomMessageBtn", "Send to room", "primary"),
      button("allowRoomContinueBtn", "Send continue")
    ])
  ]);
}

function label(text, child) { return h("label", {}, [text, child]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }
