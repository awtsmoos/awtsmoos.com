// B"H
import { applyTreeScale } from "../visuals/TreeScaleTuning.js";
const tree = { name:"cedar tree", scale:{ x:1, y:1, z:1 }, children:[] };
console.log(JSON.stringify({ result:applyTreeScale(tree), scale:tree.scale }, null, 2));
