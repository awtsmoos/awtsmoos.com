// B"H
/** Scene budgets: this report is aggressive speed truth, not a promise. */
export function fastSceneBudget(tier = {}) {
  const low = tier.tier === "low";
  const mobile = Boolean(tier.mobile);
  const medium = tier.tier === "medium";
  return {
    grassDistance: mobile ? 18 : low ? 24 : medium ? 32 : 42,
    treeDistance: mobile ? 48 : low ? 64 : medium ? 82 : 105,
    npcDistance: mobile ? 38 : low ? 50 : medium ? 68 : 84,
    particleLimit: mobile ? 10 : low ? 16 : medium ? 28 : 44,
    shadowMode: "off",
    cssBlur: false,
    maxDistantActors: mobile ? 8 : low ? 10 : medium ? 16 : 22,
    seal: "speed-scene-budget-bh4"
  };
}

export default fastSceneBudget;
