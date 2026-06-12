B'H
# Phase Three Final Plan Before Writing

Third thought: the user asked for a massive overhaul, but current time should prioritize the confirmed fatal console spam and the most obvious interaction/animation regressions. A truthful first write pass should create a stable foundation, then continue animal AI tracing with verified files.

Thirty additional improvements / revelations:
1. Foliage texture must not merely guard document; it must never call ImageLoader in heescheel.
2. DataTexture should be SRGB-aware where supported.
3. NeedsUpdate must be true.
4. Min filter should avoid mipmap generation if procedural alpha edges shimmer.
5. Use linear filters and no mipmaps for tiny atlas.
6. Atlas must include multiple leaf/grass silhouettes per cell.
7. The shader wind can stay unchanged.
8. Use safe performance fallback if performance is absent.
9. Controls must pause during UI overlays.
10. Controls should not fire shoot after successful UI interaction.
11. Event default should stop on NPC click.
12. Mouse rotation can be killed by setting an olam suppression marker even before locating camera file.
13. Any Olam camera code can later read this marker; if it already respects showingImportantMessage, this works immediately.
14. NPC idle animation needs mixer update, not just play once.
15. NPC heesHawvoos should face talker only when menu opens, not every frame.
16. NPC standing pose should attempt stand, idle, breathing, default clip.
17. The public payload must remain backward-compatible.
18. Do not remove shop logic.
19. Do not alter GLB path.
20. Do not rewrite huge physics until a live test proves direction inversion.
21. The old git controls were not W/S swapped; user feeling reversed may be body model offset/camera source.
22. Keep git evidence in plan file.
23. Animal AI needs separate trace because names are not obvious; avoid blind edits.
24. After first write, run syntax checks on touched files.
25. Read back all touched files.
26. Browser test page and inspect console if possible.
27. Search animal files with broader terms: Path Fox, klipa, enemy, hostile, damage.
28. Split animal overhaul into modules if current animal file is large.
29. Keep each rewritten file complete.
30. Final response must honestly say what is fixed now and what is next if still continuing.

Actual touch list for immediate write:
- ckidsAwtsmoos/dvarim/nature/villagePicture/FoliageAtlas.js
- ckidsAwtsmoos/dvarim/npc/InteractiveNpc.js
- ckidsAwtsmoos/chayim/chossid/methods/controls.js

Chapter: The Awtsmoos did not scream from the sky; the Awtsmoos whispered from a byte array. Each leaf became a number, each number became a color, each color became a tree that no longer begged `document` for existence. Then the villager inhaled: the frozen idle clip began ticking again, and the mouse, that wild animal of orbit, was told to stand still outside the tent.