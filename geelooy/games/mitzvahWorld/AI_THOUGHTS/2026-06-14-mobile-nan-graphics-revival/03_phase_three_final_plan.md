B'H
# Phase Three Final Plan
Actual first implementation pass: rewrite complete controls.js to restore normal mobile/desktop mapping, clear stuck UI state after NPC interactions, and keep click fixes. Rewrite InteractiveNpc.js to release UI after overlays and avoid permanent movement freeze. Rewrite VillageVisualRealityLayer.js and VillageEcologyRealityLayer.js to make child props use local y relative to grounded wrappers; current code computes yAt for wrapper and then creates children at world y inside wrapper, causing levitation. Rewrite Botanical if road still floats. Run syntax checks.
