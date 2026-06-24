B"H

# Pass 1 Discovery

The visible pain: the Tunnel Control page is visually trapped by right-side beauty/diagnostic rails, overlapping cards, and home-mode scrolling that hides content. The Mission Rooms page must reveal all known rooms automatically without making a sidebar-like chamber.

Observed files:
- index.html loads css/app.css and js/app.js.
- css/app.css imports future and legacy bundles.
- css/future/views/shell.css still declares a two-column shell even though JS mounts only main.
- css/future/views/mission-control-os.css sets body.awt-home-mode overflow:hidden and places scroll inside the grid; that explains the user-visible main area not scrolling.
- css/future/views/beauty.css creates a fixed right .awt-beauty-layer with event stream and timeline side panel behavior.
- js/boot/init.js imports and mounts mountBeautyLayer after shell.
- js/shell/mountShell.js already intends no side rail and replaces body with only main plus portals.
- js/features/missionRooms/view.js uses an aside for room list and a two-column layout.
- js/features/missionRooms/controller.js discovers at boot and rejoins a selected room, then refreshes only the selected room.

Initial risk map:
- Hiding only with CSS is insufficient because the beauty layer still mounts, mutates DOM, and can fight layout.
- Body overflow hidden must be removed for home page scrolling.
- Mission rooms should use card grid first, selected room beneath/alongside without an aside semantics.
- Files over 120 lines are pre-existing. Changed files should remain small where possible; rewritten files must be full-file writes.
