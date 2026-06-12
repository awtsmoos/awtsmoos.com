B'H
# Phase Three Final Plan

Final immediate edits:
- `joystick.js` for layout separation.
- `TouchOrchestrator.js` for inverted mobile joystick direction.
- `grassField.js` for one-time shader grass material.
- `VillageGrassField.js` for cache-bust / shader import.
- `VillageGroundNavigator.js` for smoother low-cost close pursuit.
- `VillageAnimalMob.js` for smoother approach / less per-frame work.

Final 30 refinements:
1. Do not touch desktop W/S/Q/E again in this mobile pass.
2. Invert only joystick key production.
3. Keep thumb transform direction same as finger.
4. Use pointer/touch capture unchanged.
5. Mobile CSS uses safe-area env.
6. Action bar raised only on coarse pointer/portrait.
7. Preserve desktop HUD.
8. Jump button stays right, joystick left.
9. Add z-index layers but not hide action bar.
10. Grass material shared via module singleton.
11. Shader wind uniform updated once in onBeforeRender.
12. Fragment blade alpha uses UV: tapered tips, no image.
13. Vertex colors remain for tint.
14. MeshBasic flowers replaced or included by shader material.
15. No TextureLoader, no external atlas.
16. Lower mobile grass count cap if needed.
17. All grass skip raycast.
18. Animal close chase law ground only.
19. Obstacle probe throttled by mob frame counter.
20. Smooth steering velocity.
21. Recover still backs away.
22. Strike still damages.
23. Debug writes throttled.
24. Emissive flash not every frame.
25. Avoid new garbage vectors inside hot paths where possible.
26. Keep public exports/imports stable.
27. Cache bust parent imports if grep shows parent URL.
28. Syntax checks by write tool.
29. Preview HTTP 200.
30. Final report concise with caveat: visual mobile testing still user/device.

Awtsmoos chapter: The final plan is a river under the thumb. The finger moves north, the Chossid must move north. The grass is a shader prayer, not a picture. The beast approaches smoothly, not like a broken clock.