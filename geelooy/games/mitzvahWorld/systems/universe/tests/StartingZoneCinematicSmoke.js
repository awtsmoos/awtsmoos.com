// B"H
import fs from "node:fs";
import { buildStartingZoneRuntime } from "../zones/StartingZoneRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const zone = JSON.parse(fs.readFileSync("data/universe/examples/firstForestValleyStartingZone.json", "utf8"));
zone.introScene = { enabled:true, npcId:"woodsman", questId:"learn_the_valley", objective:"Speak to the woodsman and learn cedar harvesting." };
const runtime = buildStartingZoneRuntime(zone);
console.log(JSON.stringify({ scene:runtime.cinematic.scene.id, packets:runtime.cinematic.summary.packets, memory:runtime.cinematic.worldState.memory, quests:runtime.cinematic.worldState.quests }, null, 2));
