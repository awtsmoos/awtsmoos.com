# B"H
# Canonical GLB Wardrobe and Tailor

The wardrobe is derived from `assets/models/player/chossid.glb`, not from screenshots. The GLB preserves garment metadata in node extras and separates shirt, trousers, and shoes through body primitive material names.

## Meaningful garment groups

Internal tefillin exporter pieces are grouped as two items:

- Tefillin Shel Rosh: head box, batim, shin components, and head straps.
- Tefillin Shel Yad: arm box, bayis, and arm straps.

Other independent visuals are glasses, top hat, yarmulke, jacket, tefillin-compatible jacket, and outer shirt. Inner shirt, trousers, and shoes are body-material garments.

## Required garments

Inner shirt, trousers, and shoes appear in Equipped and may change color or fabric. They cannot be unequipped or dropped because the GLB does not provide a separate bare replacement mesh.

## Appearance

Color and fabric selections are validated by the item definition and persisted in inventory state. Garment materials are cloned once for the actor before mutation. Fabric canvases are generated once per preset and cached; no appearance texture is allocated per frame. Tefillin remain restricted to black leather.

## Attributes

Every garment has legacy damage, defense, and focus compatibility plus ten gameplay attributes: Chochmah, Binah, Daas, Chesed, Gevurah, Tiferes, Netzach, Hod, Yesod, and Malchus. Equipped totals are derived by the authoritative inventory store.

## Tailor

Reb Shlomo the Tailor is a second isolated canonical Chossid GLB actor. Selecting him opens a dedicated clothing panel. Purchases use Perutas from the same inventory store that receives real loot rewards. The existing general market remains separate.
