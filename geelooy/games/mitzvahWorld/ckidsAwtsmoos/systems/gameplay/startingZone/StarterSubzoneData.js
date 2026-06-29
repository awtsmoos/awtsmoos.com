// B"H
/**
 * @typedef {Object} StarterRoadData
 * @property {string} id Road id used for rendering and collision records.
 * @property {string} name Display/debug name.
 * @property {ReadonlyArray<[number, number]>} points X/Z spline points.
 * @property {number} width Solid road width; renderer may use instanced slabs.
 * @property {boolean} isSolid Road participates in movement/collider checks.
 * @property {string} material Material recipe id.
 */

/**
 * @typedef {Object} StarterHouseData
 * @property {string} id Stable house id.
 * @property {string} name Player-facing house name.
 * @property {{x:number,z:number}} position Center position.
 * @property {{width:number,depth:number,height:number}} size Procedural house bounds.
 * @property {string} preset Existing procedural-house preset name.
 * @property {string} owner Villager/family/service owner.
 * @property {string} subzone Parent subzone id.
 * @property {string} doorId Door entity id.
 * @property {string} interiorId Indoor zone id to open when clicked.
 * @property {number} lodBlobDistance Distance where the house becomes a blob.
 */

/**
 * @typedef {Object} StarterDoorData
 * @property {string} id Door id.
 * @property {string} houseId Owning house.
 * @property {string} icon UI/world icon.
 * @property {{x:number,z:number}} position Clickable world position.
 * @property {number} range Interaction range.
 * @property {string} opens Indoor zone id.
 * @property {boolean} clickable True when the player can click/select it.
 */

/**
 * @typedef {Object} StarterSubzoneData
 * @property {string} id Small area id. Each subzone can stream and update alone.
 * @property {string} name Display/debug name.
 * @property {{x:number,z:number,radius:number}} bounds Soft circular area bounds.
 * @property {ReadonlyArray<StarterRoadData>} roads Roads born in this subzone.
 * @property {ReadonlyArray<StarterHouseData>} houses Procedural houses.
 * @property {ReadonlyArray<StarterDoorData>} doors Clickable doors.
 * @property {ReadonlyArray<Object>} encounters Enemy spawn rows.
 * @property {ReadonlyArray<Object>} population Friendly NPC rows.
 * @property {ReadonlyArray<Object>} forest Tree/vegetation instance rows.
 */

const HOUSES = [
  ["rebbe_house", "Rebbe House", -18, 16, "rebbe", "learning_green"],
  ["toolmaker_house", "Toolmaker House", 26, 18, "toolmaker", "learning_green"],
  ["bakery_house", "Village Bakery", 62, -12, "baker", "market_lane"],
  ["trainer_house", "Training Hall", -44, -24, "trainer", "market_lane"],
  ["guest_house", "Guest House", 104, 40, "host", "forest_edge"],
  ["watch_house", "Watch House", 145, 72, "guard", "forest_edge"]
].map(([id, name, x, z, owner, subzone], index) => ({
  id,
  name,
  position:{ x, z },
  size:{ width:18 + (index % 3) * 3, depth:16 + (index % 2) * 4, height:8 + (index % 2) },
  preset:index % 2 ? "HouseWithPatio" : "SingleRoom",
  owner,
  subzone,
  doorId:`${id}_door`,
  interiorId:`interior_${id}`,
  lodBlobDistance:190
}));

const DOORS = HOUSES.map(house => ({
  id:house.doorId,
  houseId:house.id,
  icon:"🚪",
  position:{ x:house.position.x, z:house.position.z - house.size.depth / 2 - 1.2 },
  range:5.5,
  opens:house.interiorId,
  clickable:true
}));

/**
 * Data for the first tiny MMO map. Roads lead to actual procedural houses, and
 * each house has a clickable door with an indoor-zone id.
 *
 * @type {ReadonlyArray<StarterSubzoneData>}
 */
export const STARTER_SUBZONES = Object.freeze([
  {
    id:"learning_green",
    name:"Learning Green",
    bounds:{ x:0, z:12, radius:72 },
    roads:[
      { id:"main_learning_road", name:"Learning Road", points:[[-70, 0], [-20, 8], [28, 8], [75, -4]], width:8, isSolid:true, material:"gold_cobble" },
      { id:"rebbe_walk", name:"Rebbe Walk", points:[[-18, 8], [-18, 8]], width:2.8, isSolid:true, material:"stone" }
    ],
    houses:HOUSES.filter(h => h.subzone === "learning_green"),
    doors:DOORS.filter(d => HOUSES.find(h => h.id === d.houseId)?.subzone === "learning_green"),
    population:[{ role:"rebbe", count:1, services:["gossip", "quest", "trainer"] }, { role:"learner", count:10, services:["gossip"] }],
    encounters:[{ species:"cow", count:8, center:{ x:35, z:35 }, spread:34 }, { species:"fox", count:8, center:{ x:70, z:48 }, spread:38 }],
    forest:[{ species:"oak", count:140, center:{ x:20, z:70 }, radius:90, lod:"instanced" }]
  },
  {
    id:"market_lane",
    name:"Market Lane",
    bounds:{ x:26, z:-30, radius:78 },
    roads:[
      { id:"market_spine", name:"Market Spine", points:[[0, -4], [25, -22], [66, -18], [106, -36]], width:7, isSolid:true, material:"dirt" },
      { id:"training_walk", name:"Training Walk", points:[[-44, -12], [-44, -32]], width:2.4, isSolid:true, material:"stone" }
    ],
    houses:HOUSES.filter(h => h.subzone === "market_lane"),
    doors:DOORS.filter(d => HOUSES.find(h => h.id === d.houseId)?.subzone === "market_lane"),
    population:[{ role:"vendor", count:6, services:["vendor", "gossip"] }, { role:"trainer", count:4, services:["trainer", "gossip"] }],
    encounters:[{ species:"boar", count:8, center:{ x:98, z:-36 }, spread:36 }, { species:"archer", count:5, center:{ x:125, z:-22 }, spread:44 }],
    forest:[{ species:"willow", count:95, center:{ x:88, z:-75 }, radius:76, lod:"instanced" }]
  },
  {
    id:"forest_edge",
    name:"Forest Edge",
    bounds:{ x:130, z:64, radius:110 },
    roads:[
      { id:"forest_road", name:"Forest Road", points:[[74, -4], [102, 28], [132, 60], [178, 96]], width:6.5, isSolid:true, material:"packed_dirt" },
      { id:"watch_walk", name:"Watch Walk", points:[[145, 58], [145, 82]], width:2.2, isSolid:true, material:"stone" }
    ],
    houses:HOUSES.filter(h => h.subzone === "forest_edge"),
    doors:DOORS.filter(d => HOUSES.find(h => h.id === d.houseId)?.subzone === "forest_edge"),
    population:[{ role:"guard", count:5, services:["gossip", "quest"] }, { role:"traveler", count:4, services:["gossip", "vendor"] }],
    encounters:[{ species:"wolf", count:9, center:{ x:158, z:92 }, spread:56 }, { species:"fox", count:7, center:{ x:190, z:110 }, spread:48 }, { species:"archer", count:5, center:{ x:176, z:52 }, spread:42 }],
    forest:[{ species:"pine", count:230, center:{ x:170, z:118 }, radius:130, lod:"instanced-impostor" }]
  }
]);

export const STARTER_WORLD_REQUIREMENTS = Object.freeze({
  minFriendlyNpcs:32,
  minEnemies:50,
  minHouses:6,
  minClickableDoors:6,
  targetFps:60,
  activeEnemyBudget:18,
  activeNpcBudget:20,
  updateBubble:88,
  visibleBubble:340,
  farBubble:760,
  spatialCellSize:32
});

export default STARTER_SUBZONES;
