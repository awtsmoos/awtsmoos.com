// B"H
import { makeWorkerWorldReport } from "../visuals/WorkerWorldReport.js";
const report = makeWorkerWorldReport({ olam:{ scene:{ children:[] }, player:{}, worldOctree:{}, combatManager:{} }, scene:{ children:[{ name:"tree" }] }, nivrayim:[], postbuild:{ ok:true, elapsedMs:5 } });
console.log(JSON.stringify({ hasPostbuild:report.hasPostbuild, postbuild:report.postbuild, trees:report.trees }, null, 2));
