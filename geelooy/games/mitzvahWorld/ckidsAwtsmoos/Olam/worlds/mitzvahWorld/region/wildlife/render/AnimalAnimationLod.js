// B"H
/** @file AnimalAnimationLod.js @description Keeps near animals beautiful and far animals cheap. */
const RATE = Object.freeze({ full:0, medium:83, low:180, frozen:Infinity });
const URGENT = new Set(["attack", "bite", "pounce", "death", "dead"]);
function levelOf(root) { if (root?.userData?.animationLevel) return root.userData.animationLevel; const tier = root?.userData?.__partitionTier; if (tier === "sleep") return "frozen"; if (tier === "far") return "low"; if (tier === "mid") return "medium"; return "full"; }
export function shouldAnimateAnimal(root, state = "idle") { const level = levelOf(root), now = performance.now(); root.userData ||= {}; root.userData.animationLevel = level; if (URGENT.has(state)) return { ok:true, level }; const wait = RATE[level]; if (wait === Infinity) return { ok:false, level }; if (!root.userData.lastAnimalAnimAt || now - root.userData.lastAnimalAnimAt >= wait) { root.userData.lastAnimalAnimAt = now; return { ok:true, level }; } return { ok:false, level }; }
export default shouldAnimateAnimal;
