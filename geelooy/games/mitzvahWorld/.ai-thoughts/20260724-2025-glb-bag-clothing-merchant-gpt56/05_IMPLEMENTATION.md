# B"H
# Implementation

## Canonical model evidence

The wardrobe was derived by parsing `assets/models/player/chossid.glb` as GLB v2. Runtime garment discovery reads `node.userData.gltfNode.extras`, which the loader preserves. Verified extras are glasses, head tefillin straps, tefillin head box, top hat, yarmulke, arm tefillin box, jacket, tefillin-compatible jacket, outer shirt, and arm straps. The body mesh separately exposes shirt, pants, and shoes material groups.

## Meaningful Bag items

Exporter fragments are grouped into human clothing items. Shel Rosh includes its head box and straps. Shel Yad includes its arm box and straps. Jacket and its tefillin-compatible alternate are one coat item. Required body-material garments appear as Inner Shirt, Trousers, and Walking Shoes.

Required base garments remain visible and may change appearance, but cannot be removed or dropped because the GLB has no separate bare replacement meshes. Glasses, hat, yarmulke, outer shirt, jacket, Shel Rosh, and Shel Yad may be equipped or unequipped.

## Appearance and attributes

Each garment definition has controlled colors and fabrics. Tefillin are restricted to black leather. Actor garment materials are cloned once before mutation. Neutral fabric canvases are generated once per preset and cached; no fabric texture is allocated per frame. Color and fabric choices persist through inventory serialization.

Every item keeps legacy damage, defense, and focus compatibility and adds ten attributes: Chochmah, Binah, Daas, Chesed, Gevurah, Tiferes, Netzach, Hod, Yesod, and Malchus. Equipped totals are derived by the authoritative InventoryStore.

## Bag

The equipment grid contains fifteen named slots: glasses, hat, yarmulke, Shel Rosh, Shel Yad, jacket, outer shirt, inner shirt, trousers, shoes, hand, offhand, tool, accessory, and book. Item details show requirement status, appearance, legacy stats, and non-zero spiritual attributes. Context actions support equip, lawful unequip, Next Color, Next Fabric, draw, sheath, open, pin, inspect, and drop where allowed.

## Reb Shlomo the Tailor

A second isolated canonical Chossid actor stands at a deterministic market position. Reb Shlomo owns independent bones, imported animations, inventory, equipment, and garment materials. Selecting him opens a dedicated tailor panel. The panel uses the exact same `runtime.inventory` that receives loot and equips the player GLB. Purchases consume real Perutas and place the purchased garment into the real Bag. Sacred tefillin are not sold.
