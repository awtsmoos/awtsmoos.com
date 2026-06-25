// B"H
/**
 * VillageReputationRules
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export const REPUTATION_RULES=Object.freeze({ help:10, deliver:8, craft:6, train:4, harm:-20 });
export const reputationDelta=kind=>REPUTATION_RULES[kind]||0;
export default { REPUTATION_RULES, reputationDelta };
