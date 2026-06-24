// B"H

import { h, out } from "../../ui/dom.js";
import { DEFAULT_AGENT } from "./state.js";

/**
 * B"H
 * Chapter 717: The room page stopped pretending to be a tool index.
 *
 * Only rooms appear first. Open a room, then see its messages, composer, and
 * the live tunnel calls that belong to that chamber.
 */
export function createMissionRoomsView() {
  return h("section", { className: "pane awt-room-console", data: { pane: "missionRooms" } }, [
    head(), compactControls(), h("article", { className: "awt-room-layout" }, [roomsPanel(), selectedPanel(), commandsPanel()]), jsonDetails()
  ]);
}

function head() {
  return h("div", { className: "page-head awt-room-head" }, [
    h("p", { className: "eyebrow", text: "ROOMS" }), h("h2", { text: "Mission rooms" }),
    h("p", { text: "Choose an available room. After it opens, watch that room's messages and live tunnel tool calls." })
  ]);
}

function compactControls() {
  return h("article", { className: "panel stack awt-room-controls" }, [
    h("div", { className: "form-grid awt-room-compact-controls" }, [
      label("Root filter", h("input", { id: "roomProjectRoot", placeholder: "/Users/.../project or keyword" })),
      label("Agent id", h("input", { id: "roomAgentId", value: DEFAULT_AGENT })),
      label("Poll ms", h("input", { id: "roomPollMs", type: "number", min: "1500", value: "5000" }))
    ]),
    h("div", { className: "button-row awt-room-quick-actions" }, [button("discoverRoomsBtn", "Refresh rooms", "primary"), button("refreshRoomBtn", "Refresh open room"), button("copyRoomLinkBtn", "Copy room link")]),
    h("div", { id: "roomStatus", className: "notice", text: "Loading available rooms." })
  ]);
}

function roomsPanel() {
  return h("section", { className: "panel stack awt-room-list-panel" }, [h("div", { className: "awt-section-title", text: "Available rooms" }), h("div", { id: "roomList", className: "awt-room-list awt-room-card-grid" })]);
}

function selectedPanel() {
  return h("section", { className: "panel stack awt-room-main" }, [h("div", { id: "roomHeader", className: "awt-room-header", text: "Open a room to see its chat." }), h("div", { id: "roomMetrics", className: "awt-room-metrics" }), h("div", { id: "roomMessages", className: "awt-room-messages" }), composer()]);
}

function composer() {
  return h("div", { className: "stack awt-room-composer" }, [
    label("Message to room", h("textarea", { id: "roomMessage", placeholder: "Message the agents in this room. Use continue / go on to let them proceed." })),
    h("div", { className: "button-row" }, [label("Block agents until response", h("input", { id: "roomBlockAgents", type: "checkbox", checked: true })), button("sendRoomMessageBtn", "Send message", "primary"), button("allowRoomContinueBtn", "Send continue")])
  ]);
}

function commandsPanel() {
  return h("section", { className: "panel stack awt-room-command-panel" }, [h("div", { id: "roomCommandsHeader", className: "awt-section-title", text: "Room tunnel calls" }), h("div", { id: "roomCommandTable", className: "awt-room-command-table" })]);
}

function jsonDetails() {
  return h("details", { className: "panel stack awt-room-json" }, [h("summary", { text: "Room JSON" }), out("roomOut", "No room loaded.")]);
}

function label(text, child) { return h("label", {}, [text, child]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }
