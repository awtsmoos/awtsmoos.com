B'H
# Phase Three: Final Strategy
Implement immediate fixes: mobile tap must set chossid.selected/intersected/interactingWith/targetedEntity when raycast hits an enemy or NPC, even if camera facing differs. Attack must auto-target selected/approached/nearest enemy within radius and optionally rotate toward it before firing. Facing must derive from last actual world position delta, not input axes alone. Trees: find old blob renderer source and make all tree layers use complex trunk/limb/crown renderer or hide simple tree layer. Verify syntax and grep for old tree blobs.
