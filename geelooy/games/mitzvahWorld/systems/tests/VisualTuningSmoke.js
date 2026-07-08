// B"H
import { applyTreeScale } from "../visuals/TreeScaleTuning.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const tree = { name:"cedar tree", scale:{ x:1, y:1, z:1 }, children:[] };
console.log(JSON.stringify({ result:applyTreeScale(tree), scale:tree.scale }, null, 2));
