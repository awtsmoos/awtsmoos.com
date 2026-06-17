// B"H
import { makeWorkerWorldReport } from "../visuals/WorkerWorldReport.js";
const scene = { children:[{ name:"tall_tree_1" }, { name:"yeshiva_building" }, { name:"grass_patch" }] };
const olam = { scene, player:{}, worldOctree:{}, combatManager:{} };
const nivrayim = [{ type:"chossid" }, { name:"village_merchant_npc" }, { name:"goat_animal" }];
console.log(JSON.stringify(makeWorkerWorldReport({ olam, scene, nivrayim, elapsedMs:12, source:"smoke" }), null, 2));
