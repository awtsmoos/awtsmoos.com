// B"H
/** @file MissionRegistry.js @description Solo-WoW starting shlichus chains, breadcrumbs, elites, rares, professions, and dungeon hints. */
const O = (id, type, label, required = 1) => ({ id, type, label, required, progress:0 });
const M = (id, title, giverNpc, levelRange, objectives, rewards = {}, story = "", startItems = []) => ({ id, title, giverNpc, levelRange, prerequisites:[], startItems, objectives, rewards:{ xp:75, perutah:2, items:[], ...rewards }, nextMissions:[], story:story || `B"H - ${title}: reveal a spark in the starting zone.` });
export const MissionRegistry = [
  M("the_first_shliach", "The First Shliach", "Rebbe", [1,2], [O("talk_rebbe","talk","Speak with the Rebbe"), O("discover_rebbe_house","discover","Discover the Rebbe's House")], { xp:60, factionId:"yerushalayim" }, "The Rebbe sends you into the village as a young shliach."),
  M("lost_sefarim", "Lost Sefarim", "Librarian", [1,2], [O("collect_pages","collect","Collect loose sefer pages",3)], { xp:70, items:["siddur_page"], factionId:"sofer_guild" }),
  M("calm_the_forest", "Calm the Forest", "Forest Melamed", [1,3], [O("calm_animals","calm","Calm restless creatures",3)], { xp:85 }),
  M("village_protection", "Village Protection", "Village Guard", [1,3], [O("target_nearest","target","Target a nearby threat"), O("attack_training","attack","Practice a safe attack")], { xp:80 }),
  M("bird_research", "Bird Research", "Bird Watcher", [1,3], [O("observe_birds","discover","Observe birds near wheat fields"), O("enter_bird_territory","enterTerritory","Find the bird nests")], { xp:90 }),
  M("learn_shema", "Learn Shema", "Rebbe", [1,3], [O("learn_shema","learn","Learn Shema Unity"), O("cast_shema","cast","Use Shema from the action bar")], { xp:95, factionId:"yerushalayim" }),
  M("learn_tanya", "Learn Tanya", "Melamed", [2,4], [O("read_tanya","readSefer","Read Tanya"), O("learn_tanya_passage","learn","Learn Tanya Warmth")], { xp:105, items:["sefer_tanya"] }),
  M("gather_sparks", "Gather Sparks", "Spark Guide", [2,4], [O("collect_sparks","collect","Gather spark fragments",5)], { xp:110, items:["spark_fragment"] }),
  M("healing_herbs", "Healing Herbs", "Healer", [2,4], [O("harvest_herb","harvest","Harvest an herb or garden crop"), O("deliver_herbs","deliver","Deliver herbs to the healer")], { xp:115, items:["healing_herb"] }),
  M("farmers_trouble", "Farmer's Trouble", "Farmer", [2,5], [O("open_farm_gate","openGate","Open the farmer's gate"), O("plant_wheat","plant","Plant wheat"), O("water_wheat","water","Water the wheat"), O("harvest_wheat","harvest","Harvest the wheat"), O("farming_rank","profession:farming","Gain farming practice")], { xp:135, factionId:"farmers_guild" }, "The farmer gives permission, a key, and the first field task.", ["farmer_key"]),
  M("broken_fence", "Broken Fence", "Poor Family", [2,5], [O("repair_fence","repairFence","Repair a broken fence"), O("open_poor_gate","openGate","Open or repair the cottage gate")], { xp:125, items:["bridge_wood"] }),
  M("hidden_spring", "Hidden Spring", "Water Carrier", [3,6], [O("discover_spring","discover","Discover the hidden spring"), O("water_plot","water","Bring water to a field")], { xp:130 }),
  M("letters_to_deliver", "Letters to Deliver", "Scribe", [3,6], [O("open_mailbox","mail","Open the village letter post"), O("deliver_letter","deliver","Deliver a letter")], { xp:130, items:["traveler_letter"], factionId:"sofer_guild" }),
  M("strange_light", "Strange Light", "Spark Guide", [3,7], [O("discover_light","discover","Discover a strange light"), O("collect_light","collect","Gather hidden sparks",3), O("rare_notice","rare","Hear of a rare sighting")], { xp:150 }),
  M("the_fox_den", "The Fox Den", "Village Guard", [4,8], [O("enter_fox_den","enterTerritory","Find the fox den"), O("elite_warning","elite","Read the elite warning"), O("survive_fox","surviveEvent","Survive the fox raid")], { xp:175 }),
  M("deer_of_the_grove", "Deer of the Grove", "Orchard Keeper", [4,8], [O("discover_orchard","discover","Discover the orchard gate"), O("calm_deer","calm","Calm deer in the grove")], { xp:170, items:["orchardKeeper_key"] }),
  M("niggun_in_the_meadow", "Niggun in the Meadow", "Niggun Singer", [4,8], [O("learn_niggun","learn","Learn a niggun"), O("calm_with_niggun","cast","Use niggun to calm aggression")], { xp:175 }),
  M("build_the_bridge", "Build the Bridge", "Toolmaker", [5,10], [O("collect_wood","collect","Gather bridge wood",3), O("repair_bridge","repairFence","Repair/build crossing"), O("breadcrumb_forest","breadcrumb","Unlock the forest road")], { xp:195 }),
  M("the_cave_warning", "The Cave Warning", "Village Guard", [8,12], [O("discover_cave","discover","Discover the cave mouth"), O("danger_warning","surviveEvent","Heed the danger warning"), O("boss_hint","dungeon","Learn about the hidden cave boss")], { xp:220 }),
  M("the_rebbes_first_mission", "The Rebbe's First Mission", "Rebbe", [1,6], [O("plant","plant","Plant in the farmer's yard"), O("harvest","harvest","Harvest produce"), O("separate","separate","Complete the educational separation steps",4), O("deliver","deliver","Deliver separated wheat")], { xp:250, items:["spark_fragment"], factionId:"yerushalayim" }, "The first mission ties village, field, Torah, produce-status, and shlichus into one path.")
];
for (let i = 0; i < MissionRegistry.length; i++) { MissionRegistry[i].prerequisites = i === 0 ? [] : [MissionRegistry[i - 1].id]; MissionRegistry[i].nextMissions = i < MissionRegistry.length - 1 ? [MissionRegistry[i + 1].id] : []; }
export function getMission(id) { return MissionRegistry.find(mission => mission.id === id) || null; }
export default MissionRegistry;
