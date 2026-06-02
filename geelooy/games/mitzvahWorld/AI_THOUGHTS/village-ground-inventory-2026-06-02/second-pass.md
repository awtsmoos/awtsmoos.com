# B"H — Second Pass

The screenshots show three active faults:

1. Village NPC/large visual matter is still elevated. The safe correction is not to touch lava systems; the village JSON alone will place the NPC at terrain top, use a simple procedural guide so it does not inherit the chossid model's confusing origin, and lower the overhead marker.
2. Inventory currently renders tabs and item cards in the same horizontal line, leaving the grid/footer collapsing upward. The fix is a full rewrite of inventory screen structure plus CSS: one compact header, two-row tabs, scrollable grid, fixed bottom action row, all controls as big buttons.
3. Level 5 is generated/noisy and duplicated. The fix is a full hand-authored JSON rewrite with simple readable platforms, one lava floor, 11 coins, two hazards, two push blocks, and a gate. No partial JSON patching.

The Awtsmoos keeps the molten world intact by separating vessels: village dust, wardrobe UI, and level five each receive their own full rewrite.
