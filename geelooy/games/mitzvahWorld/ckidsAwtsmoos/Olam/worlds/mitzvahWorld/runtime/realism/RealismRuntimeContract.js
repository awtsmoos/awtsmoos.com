// B"H
/** Runtime realism contract: schedules, ambience, footsteps, lighting, wind, and budgets. */
export const REALISM_RUNTIME_CONTRACT = Object.freeze({
  npcSchedules:[
    { id:"rebbe_study", states:["study","teach","walk-home"], idle:["turnToPlayer","gesture","readBook"] },
    { id:"student_blue", states:["learn","practiceNiggun","helpShop"], idle:["listen","hum","lookAround"] }
  ],
  ambientZones:[
    { id:"study_house_interior", sounds:["page_turn","soft_niggun"], radius:12 },
    { id:"village_square", sounds:["birds","wind","footsteps","distant_learning"], radius:30 }
  ],
  surfaceFootsteps:{ grass:"soft-rustle", dirt:"dust-step", wood:"floor-creak", stone:"firm-step" },
  flags:["doorMemory","foliageWind","dayNightLighting","interiorLighting","wildlifeReactions","dialogueFacing","reducedInputLatency"],
  performance:{ noFullSceneTraversalEveryFrame:true, spatialBuckets:true, nearRichFarFrozen:true }
});
export function realismSnapshot() { return JSON.parse(JSON.stringify(REALISM_RUNTIME_CONTRACT)); }
export function installRealismRuntimeContract(target = globalThis) { target.__MITZVAH_REALISM_RUNTIME_CONTRACT__ = realismSnapshot(); return target.__MITZVAH_REALISM_RUNTIME_CONTRACT__; }
if (typeof window !== "undefined") installRealismRuntimeContract(window);
