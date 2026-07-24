# B"H
# Final Handoff

## Delivered public behavior

The Bag no longer relies on a tiny hard-coded clothing list. It maps the actual canonical GLB wardrobe into meaningful equipment items and shows required base garments that remain on the body.

The inventory store now owns persistent per-item color and fabric choices, required-garment enforcement, and ten spiritual attribute totals. The equipment runtime applies visibility and appearance directly to isolated GLB garment materials whenever inventory state changes.

Reb Shlomo the Tailor is a second canonical Chossid GLB actor and world target. His dedicated panel sells lawful clothing alternatives for real Perutas through the same authoritative player inventory used by loot, Bag, and model equipment.

## Important invariants

- Tefillin exporter fragments are grouped into Shel Rosh and Shel Yad.
- Tefillin are black leather and not merchant stock.
- Inner shirt, trousers, and shoes are visible required garments.
- Required garments may change appearance but may not be unequipped or dropped.
- The normal jacket is replaced by its verified tefillin-compatible GLB alternate while Shel Yad is equipped.
- Glass lens transparency is preserved during frame-color changes.
- Shared canonical GLB materials are never mutated directly.
- Appearance work occurs on inventory publication/model binding, not per frame.

## Evidence locations

Artifact directory:
`/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/20260724-bag-clothing-merchant-gpt56`

Planning and source handoff:
`.ai-thoughts/20260724-2025-glb-bag-clothing-merchant-gpt56`

No commit was created.
