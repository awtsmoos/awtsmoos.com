B"H
Boruch Hashem
Blessed is He

# Main River Village — Canonical Hero Slice

The Awtsmoos renews river, home, grass, neighbor, useful object, and mission as one lived valley before any subsystem sees only its own file. Awtsmoos.com records this slice so future work improves one coherent place instead of multiplying disconnected village demos.

## PURPOSE

The initial hero settlement is the canonical alpine village's **Lower River Garden / bridge-to-lake** slice.

It is intentionally sparse and river-dominant while retaining the full authored village identity behind streaming, schedules, maps, and quests.

## PRIMARY POLICY

- Immediate cottage manifestation: **H27 + H10 only**.
- Complete canonical H10–H27 catalog remains authoritative for NPC homes and broader world logic.
- River geography remains the existing source→cascades→bridge reach→lower river→lake→outlet spine.
- Medium terrain uses a bounded four-layer ecological texture page over immediate procedural terrain.
- Medium quality starts four existing friendly actors around the inhabited river community.
- Community props use one deterministic exclusion-aware site plan and existing batched renderers.
- `RiverCrossingShlichus` remains the canonical bridge gameplay mission.

## CAPABILITY MAP

| Need | Canonical file |
| --- | --- |
| Hero budgets/id | `MainRiverVillageProfile.js` |
| Shared anchors | `MainRiverVillageAnchors.js` |
| Two-house selection | `MainRiverVillageHouseSelection.js` |
| Reach morphology | `MainRiverVillageRiverPolicy.js` |
| River width | `VillageRiverPath.js` |
| River depth/flow/banks | `VillageRiverChannelProfile.js` |
| Terrain texture page | `../materials/MainRiverVillageSurfaceMix.js` |
| Terrain material | `../terrain/TerrainMaterialFactory.js` |
| NPC initial stations | `MainRiverVillageNpcAnchors.js` |
| NPC profiles/schedules | `../npc/FriendlyNpcProfiles.js` |
| Object site plan | `MainRiverVillageObjectPlan.js` |
| Object dimensions | `MainRiverVillageObjectParts.js` |
| Batched manifestation | `MainRiverVillageObjectDefinitions.js` |
| Prop integration | `VillagePropSystem.js` |
| Gameplay | `../../gameplay/RiverCrossingShlichus.js` |

## HOUSE LAW

`MainRiverVillageHouseSelection.js` is the visual selection authority.

Do not delete canonical house records to reduce scene density. Systems that visually depend on cottage existence—district placement, house bubbles, craft details, terrain seams, and interior programs—must use the same hero selection.

## RIVER LAW

`MainRiverVillageRiverPolicy.js` scales existing reach evidence only.

The lower river is intentionally much broader than the old baseline, while the bridge reach widens less. Canonical control points and cascades stay fixed. Never create a second river spline or fluid solver for this slice.

`bridge-reach-center` is hydrology evidence. It is **not** the bridge keeper's quest coordinate.

## TERRAIN LAW

The terrain shader remains immediately procedural. `TerrainMaterialFactory.js` exposes a small selected `textureLayers` page to the existing material cache/hydrator.

Do not reintroduce texture-per-object terrain loading.

## NPC LAW

Initial spawn station and daily-life schedule are separate concepts.

`FriendlyNpcProfiles.js` may use a main-river station for initial visibility, but `FriendlyNpcLifeCatalog.js` retains canonical home/work/market/shul anchors.

## OBJECT PLACEMENT LAW

`MainRiverVillageObjectPlan.js` declares intent. The procedural-core `VillageSiteAuthority` resolves positions/exclusions. `MainRiverVillageObjectParts.js` describes physical proportions. Existing `VillageBoxBatch` performs manifestation.

Keep those responsibilities separate.

## GAMEPLAY

`The Light at the River Crossing` already provides multi-stage gameplay: meet the keeper, inspect braces, recover treated timber, defeat river shades, use Torah light, report repair, then illuminate bridge lanterns.

Improve that mission through existing objective/event systems rather than creating a second quest runtime.

## NEXT FILES TO READ

- `DIRECTORY_GUIDE.md` — broad village directory snapshot.
- `MainRiverVillageProfile.js` — hero policy.
- `CanonicalVillageHydrology.js` — immutable river geography.
- `CanonicalVillageHouses.js` — complete authored house identity.
- procedural-core `core/ecosystem/README.md` — reusable site/river APIs.
