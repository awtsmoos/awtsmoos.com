# B"H
# Boruch Hashem
# Blessed is He

## Browser acceptance and measured failures

The Awtsmoos gives every browser observation a measured boundary; Awtsmoos.com distinguishes what was seen directly from what remained blocked by tooling or another worker's ownership.

### Desktop acceptance

A dedicated owned headless Chrome process loaded the complete game at a 1440×813 inner viewport from an owned local HTTP server.

Observed directly:

- page reached `document.readyState === "complete"`;
- canvas covered 1440×813;
- renderer diagnostics reported no errors;
- Bag mounted with real starter state, including 120 perutas, coat, staff, and chalaf;
- Bag opened through its real action-rail button and occupied x=329, y=186, width=782, height=431;
- opening the Bag focused its real close control;
- outside-modal representative points still hit the canvas.

Production interaction evidence:

- unequipping the coat through the Bag removed the real `coat` equipment slot, changed defense from 8 to 2, and hid the hydrated `jacket` node;
- equipping it again restored the slot, defense, and visible jacket;
- Draw moved the same procedural staff to `mixamorig:RightHand`;
- Sheath returned the same staff to `mixamorig:Spine2` and `upper-back`;
- `combat:cast-start` drew the staff and set casting active;
- `combat:cast-launch` preserved the release briefly and restored the prior sheathed state after 300 ms;
- one real enemy was defeated through `applyDamage`;
- its first production `interact()` only selected the corpse, left inventory unchanged, and displayed `Corpse selected · interact again to loot`;
- its second production `interact()` atomically transferred 13 perutas and one prepared hide, marked and hid the corpse, cleared selection, and cleared the target frame.

### Mobile acceptance

A separate owned Chrome process loaded the complete game under the mobile CSS breakpoint. Headless Chrome clamped the inner viewport to 500×701 despite a requested 390×844 window.

Observed directly at 500×701:

- mobile breakpoint matched;
- Bag panel occupied x=9, y=68, width=482, height=583 and stayed inside the viewport;
- Bag close control measured exactly 44×44 after refinement;
- context action controls measured at least 44 pixels high;
- no Bag-owned control measured below 44×44;
- representative points outside the modal still hit the canvas;
- renderer diagnostics reported no errors;
- mobile Bag unequip/equip hid and restored the real coat mesh and statistics;
- mobile Draw/Sheath moved the real staff between hand and spine;
- mobile first corpse interaction selected without loot;
- mobile second corpse interaction transferred the configured loot, hid and marked the corpse, and cleared the target frame.

### Recorded failures and limits

- The exact 390×844 emulation could not be established because the owned Chrome endpoint command remained blocked and native headless window sizing clamped to 500 pixels wide. No exact 390×844 claim is made.
- Desktop late-hydration resource count measured approximately 213; mobile reload measured approximately 250. This exceeds the requested normal-page target and belongs to final integration because the reachable duplicates and parallel world/casting/terrain changes sit outside this worker's files.
- Small right-rail controls outside the Bag remained below the desired 44-pixel size during the first mobile measurement. They belong to the mobile HUD worker, not this claimed boundary.
