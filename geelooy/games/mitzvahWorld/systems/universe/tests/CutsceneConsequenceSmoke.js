// B"H
import { applyCutsceneConsequences } from "../../cutscene/CutsceneConsequenceRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const out = applyCutsceneConsequences({}, [{type:"remember",key:"met_woodsman"},{type:"quest",id:"learn_the_valley",state:"started"}]);
console.log(JSON.stringify(out, null, 2));
