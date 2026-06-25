// B"H

import { h, out } from "../../ui/dom.js";

/** B"H: Initial Mission Rooms is a pure room lobby: rooms only. */
export function createMissionRoomsView() {
  return h("section", { className: "pane awt-room-console", data: { pane: "missionRooms" } }, [
    h("section", { id: "roomLobby", className: "awt-room-lobby" }, [head(), status(), roomsPanel()]),
    h("section", { id: "roomWorkspace", className: "awt-room-workspace is-empty" }),
    jsonDetails()
  ]);
}

function head() {
  return h("div", { className: "page-head awt-room-head" }, [
    h("p", { className: "eyebrow", text: "ROOMS" }),
    h("h2", { text: "Mission rooms" }),
    h("p", { text: "Choose an available room. Chat and room activity appear only after opening it." })
  ]);
}

function status() { return h("div", { id: "roomStatus", className: "notice", text: "Loading available rooms." }); }
function roomsPanel() { return h("div", { id: "roomList", className: "awt-room-list awt-room-card-grid" }); }
function jsonDetails() { return h("details", { className: "panel stack awt-room-json" }, [h("summary", { text: "Room JSON" }), out("roomOut", "No room loaded.")]); }
