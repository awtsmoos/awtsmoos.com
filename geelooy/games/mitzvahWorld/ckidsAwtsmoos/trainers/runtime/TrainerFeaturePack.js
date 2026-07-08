// B"H
/** @file TrainerFeaturePack.js @description Installs shared trainer gates used by shops, equipment, studio, and quests. */
import { createTrainerRequirementRuntime } from "./TrainerRequirementRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function installTrainerFeaturePack(runtime){ const gates=createTrainerRequirementRuntime(runtime); const api={ gates, train:(actorId,type,level,evidence)=>gates.train(actorId,type,level,evidence), check:(actorId,requirement)=>gates.check(actorId,requirement), canUse:(actorId,item)=>gates.canUse(actorId,item), catalog:()=>gates.catalog(), snapshot:actorId=>gates.snapshot(actorId) }; runtime.trainers=api; runtime?.markReady?.("trainers:gates", { trainerTypes:api.catalog().length }); return api; }
export default installTrainerFeaturePack;
