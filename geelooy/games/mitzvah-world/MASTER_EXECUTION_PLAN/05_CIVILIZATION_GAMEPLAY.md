B"H
Boruch Hashem
Blessed be He

# 05 — NPC Civilization, Wildlife, Traversal, Quests, Torah, Economy

## NPC identity and schedules
- [ ] stable persistent NPC IDs, home/work/community relationships, family/friend/work graphs;
- [ ] daily schedules driven by world clock, weather, work, prayer/study, needs, social events, quests;
- [ ] goal arbitration with bounded priorities; no impossible simultaneous goals;
- [ ] knowledge boundaries: NPCs know only what they observed or heard; information propagates through people/places;
- [ ] meaningful interaction memory alters future behavior/dialogue;
- [ ] indoor/outdoor shelter decisions, weather clothing, travel delays, crowd gathering/dispersion;
- [ ] nearby important NPCs resolve individually; distant civilization uses cohorts/statistics.

## Economy and settlement life
- [ ] professions: farmer, builder, baker, merchant, shepherd, teacher, artisan, etc.;
- [ ] inventory conservation; goods cannot exist in two owners after a transfer;
- [ ] supply chains such as grain → flour → bread → market/household;
- [ ] farms/orchards/grazing/irrigation, planting/growth/harvest/fallow state;
- [ ] shortages/surpluses, weather effects, road/travel effects, shop hours/stock;
- [ ] settlement activity sound/visuals derive from actual NPC work rather than loops.

## Wildlife / ecology
- [ ] habitat maps from forest, water, cliffs, fields, human activity, season/weather;
- [ ] animal needs: food, water, shelter, rest, group behavior;
- [ ] livestock herding and shelter/shade behavior;
- [ ] birds: flocks, perches, nests, seasonal/weather activity; distant flocks can be statistical;
- [ ] fish depend on water depth/flow/quality; insects/pollinators mostly statistical;
- [ ] animal tracks in mud/snow; fruit/seed/pollination hooks connect ecology.
## Traversal / character feel
- [ ] walk, run, sprint, jump, climb, balance, ledges, slopes, shallow water, stairs/ladders;
- [ ] terrain-aware acceleration/traction and surface states: dry/wet/mud/snow/ice;
- [ ] foot IK and hand IK for terrain, doors, ladders, tools, interactions;
- [ ] camera collision, smart obstruction handling, stable third-person framing;
- [ ] mobile touch, keyboard/mouse, gamepad parity; remapping and one-handed/mobile-safe layouts;
- [ ] mount/animal traversal only when animation/collision/control quality is real;
- [ ] traversal affordances are semantic Core/world data, not hardcoded per level.

## Quests / world transformation
- [ ] one canonical quest/event store, versioned and persistent;
- [ ] exact-once rewards and atomic construction/inventory transactions;
- [ ] quests point to real landmarks/NPC knowledge, not arbitrary floating markers;
- [ ] world changes persist: repaired bridge, built garden, planted tree, opened route, changed NPC schedule;
- [ ] reload must not duplicate reward, geometry, quest completion, or resource consumption;
- [ ] weather/environment can influence opportunities but must not make required progression randomly impossible;
- [ ] Creator and quest systems use the same build transaction authority.

## Torah / learning / community
- [ ] Beis Midrash and study interactions use real learning content, not decorative text only;
- [ ] separate trustworthy Torah-content authority from world geometry/gameplay;
- [ ] preserve source/provenance/citations for learning text; Hebrew/RTL rendered correctly;
- [ ] community scenes: farbrengen, dancing, learning, davening, market, family/community life need crowd formation/LOD;
- [ ] religious art/signage review prevents accidental non-Jewish motifs and bad Hebrew;
- [ ] gameplay should include quiet meaningful moments: study, forest walk, ocean, night sky, village sunset—not constant action.

## Navigation
- [ ] local navmesh/graph plus regional route graph;
- [ ] dynamic obstacle updates after construction/destruction/bridge repair;
- [ ] crowd path reservation to reduce jams;
- [ ] NPC directions reference real landmarks/roads;
- [ ] map/fog-of-discovery derives from actual world geography and discovered locations.