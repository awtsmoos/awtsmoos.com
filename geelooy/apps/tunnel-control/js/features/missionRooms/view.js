// B"H

import { h, out } from "../../ui/dom.js";
import { DEFAULT_AGENT } from "./state.js";

/**
 * B"H
 * Chapter 713: Tools, chats, and commands entered one readable chamber.
 */
export function createMissionRoomsView() {
  return h("section", { className: "pane awt-room-console", data: { pane: "missionRooms" } }, [
    head(), controls(), layout(), jsonDetails()
  ]);
}

function head() {
  return h("div", { className: "page-head" }, [
    h("p", { className: "eyebrow", text: "ROOMS" }),
    h("h2", { text: "Mission rooms" }),
    h("p", { text: "Rooms, all tunnel tools, current-chat live calls, and Codex-style agent command traces in one rail-free table." })
  ]);
}

function controls() {
  return h("article", { className: "panel stack" }, [
    h("div", { className: "form-grid" }, [
      label("Optional project root filter", h("input", { id: "roomProjectRoot", placeholder: "/Users/.../project or keyword" })),
      label("Agent id", h("input", { id: "roomAgentId", value: DEFAULT_AGENT })),
      label("Poll ms", h("input", { id: "roomPollMs", type: "number", min: "1500", value: "5000" })),
      label("Tool filter", h("input", { id: "roomToolFilter", placeholder: "command, chrome, mission, write..." }))
    ]),
    h("div", { className: "button-row" }, [
      button("discoverRoomsBtn", "Discover now", "primary"),
      button("refreshRoomBtn", "Refresh selected"),
      button("refreshRoomToolsBtn", "Refresh tools"),
      button("copyRoomLinkBtn", "Copy room link")
    ]),
    h("div", { id: "roomStatus", className: "notice", text: "Loading rooms, tools, and live tunnel calls automatically." })
  ]);
}

function layout() {
  return h("article", { className: "awt-room-layout" }, [roomsPanel(), selectedPanel(), toolsPanel(), commandsPanel()]);
}

function roomsPanel() {
  return h("section", { className: "panel stack" }, [
    h("div", { className: "awt-section-title", text: "Available rooms" }),
    h("div", { id: "roomList", className: "awt-room-list awt-room-card-grid" })
  ]);
}

function selectedPanel() {
  return h("section", { className: "panel stack awt-room-main" }, [
    h("div", { id: "roomHeader", className: "awt-room-header", text: "No room selected." }),
    h("div", { id: "roomMetrics", className: "awt-room-metrics" }),
    h("div", { id: "roomMessages", className: "awt-room-messages" }),
    composer()
  ]);
}

function toolsPanel() {
  return h("section", { className: "panel stack awt-room-tools-panel" }, [
    h("div", { id: "roomToolsHeader", className: "awt-section-title", text: "Tunnel tools" }),
    h("div", { id: "roomTools", className: "awt-room-tools" })
  ]);
}

function commandsPanel() {
  return h("section", { className: "panel stack awt-room-command-panel" }, [
    h("div", { id: "roomCommandsHeader", className: "awt-section-title", text: "Agent tunnel command table" }),
    h("div", { id: "roomCommandTable", className: "awt-room-command-table" })
  ]);
}

function composer() {
  return h("div", { className: "stack" }, [
    label("Message to room", h("textarea", { id: "roomMessage", placeholder: "Tell agents what changed. Use continue or go on to let them proceed." })),
    h("div", { className: "button-row" }, [
      label("Block agents until response", h("input", { id: "roomBlockAgents", type: "checkbox", checked: true })),
      button("sendRoomMessageBtn", "Send to room", "primary"),
      button("allowRoomContinueBtn", "Send continue")
    ])
  ]);
}

function jsonDetails() {
  return h("details", { className: "panel stack awt-room-json" }, [h("summary", { text: "Room JSON" }), out("roomOut", "No room loaded.")]);
}

function label(text, child) { return h("label", {}, [text, child]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }
