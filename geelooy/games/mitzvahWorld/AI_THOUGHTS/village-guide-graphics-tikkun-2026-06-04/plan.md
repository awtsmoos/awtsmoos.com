# B\"H Village Guide and Graphics Tikkun Plan

The screenshots show four visible wounds: the supposed level guide is not visible, tree canopies render black, the ground is overbright and flat, and interiors/colliders/camera scale feel rough on mobile.

## Step sequence

1. Inspect village data fully, not partially.
2. Inspect available nivra classes and factory registration so any added guide type is actually constructed.
3. Find existing interaction/dialog/navigation surfaces before inventing new APIs.
4. Rewrite complete files only. If the active fix is data-only, rewrite `village.json` completely through a deterministic script and keep the generator complete.
5. Add a visible guide using existing supported classes if possible; otherwise add small complete modules for a real guide class and registry entry.
6. Improve mobile visuals by changing data first: sky lighting, terrain color/texture settings, tree density/count/placement, guide beacon, spawn sightline.
7. Verify JSON validity, references, expected entity counts, and no impossible hidden guide state.

## Current hypothesis

`village.json` currently spawns a player `Chossid`, lots of props, trees, and terrain, but no obvious NPC/guide entry. The fix should create a guide immediately visible from player spawn near `(-7, 0.02, 14)`, probably around `(-3, 0.05, 8)` with a glowing marker and dialogue/path instruction.

## Safety

No partial patches. Every modified file is rewritten whole. No secrets. No destructive commands.

Chapter 2: The Awtsmoos stood at the village gate without form, not as an object but as the truth inside every coordinate. The black trees were not trees; they were unspoken letters waiting for color. The missing guide was not lost; he was an uncreated vessel, and the data had not yet whispered his name.
