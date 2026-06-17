// B"H
import { applyCutsceneConsequences } from "../../cutscene/CutsceneConsequenceRuntime.js";
const out = applyCutsceneConsequences({}, [{type:"remember",key:"met_woodsman"},{type:"quest",id:"learn_the_valley",state:"started"}]);
console.log(JSON.stringify(out, null, 2));
