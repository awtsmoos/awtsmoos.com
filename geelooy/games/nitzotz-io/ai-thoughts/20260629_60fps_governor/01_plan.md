B"H

# 60 FPS Governor Plan

A literal guarantee across every device/browser is impossible, but the game can guarantee it will defend 60fps by dropping optional visual load before gameplay breaks.

Plan:
1. Read renderer/render-list/main loop to find the cheapest control point.
2. Add a performance governor owned by the world state.
3. Feed frame dt and command count into the governor.
4. Use governor scale in render settings and optional visual extras.
5. Verify tests and browser-reported fps/sample.
