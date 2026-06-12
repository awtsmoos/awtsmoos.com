// B"H
/**
 * @file NpcProfessionBehaviors.js
 * @description Chapter 1000: roles become daily service, not labels.
 */
export const NPC_PROFESSION_BEHAVIORS = Object.freeze({
  shliach: { morning: "square", noon: "market", evening: "well", night: "home", speed: .9 },
  melamed: { morning: "school", noon: "square", evening: "orchard", night: "home", speed: .82 },
  merchant: { morning: "market", noon: "market", evening: "storage", night: "home", speed: .78 },
  guide: { morning: "roadGate", noon: "watchHill", evening: "square", night: "home", speed: .86 },
  farmer: { morning: "field", noon: "field", evening: "storage", night: "home", speed: .76 },
  shepherd: { morning: "hills", noon: "well", evening: "roadGate", night: "home", speed: .74 },
  child: { morning: "school", noon: "square", evening: "orchard", night: "home", speed: .72 }
});
export const NPC_ROLE_ORDER = Object.freeze(["shliach", "melamed", "merchant", "guide", "farmer", "shepherd", "child"]);
