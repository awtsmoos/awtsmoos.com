// B"H
export const controlLockBeat = (at=0) => ({ id:"control_lock", kind:"control", at, action:"lock_player_control" });
export const controlUnlockBeat = (at=6) => ({ id:"control_unlock", kind:"control", at, action:"unlock_player_control" });
export const wideBeat = (at=.1, target="valley") => ({ id:"valley_wide", kind:"camera", at, shot:"wide", target, duration:1.8 });
export const sunFlareBeat = (at=1) => ({ id:"sun_flare", kind:"lighting", at, style:"sunrise_gold", lensFlare:true, sunPulse:true, duration:1.5 });
export const npcRevealBeat = (npcId, at=2) => ({ id:`reveal_${npcId}`, kind:"camera", at, shot:"close", target:npcId, duration:1.2 });
export const npcDialogueBeat = (npcId, text, at=3) => ({ id:`${npcId}_line`, kind:"dialogue", at, speaker:npcId, text, duration:3 });
export const npcTalkBeat = (npcId, at=3) => ({ id:`${npcId}_talk`, kind:"animation", at, actor:npcId, action:"talk", duration:3 });
export const ambienceBeat = (at=0) => ({ id:"valley_ambience", kind:"audio", at, audioKind:"ambience", asset:"forest_morning", volume:.8, fade:1 });
export const objectiveBeat = (questId, objective, at=5) => ({ id:`objective_${questId}`, kind:"consequence", at, consequences:[{ type:"remember", key:"met_woodsman" }, { type:"quest", id:questId, state:"started" }, { type:"unlock", key:"tree_harvest_hint" }, { type:"objective", id:questId, text:objective }] });
