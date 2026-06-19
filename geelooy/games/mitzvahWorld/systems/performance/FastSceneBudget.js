// B"H
/** Scene budgets: fewer distant illusions, more living frames. */
export function fastSceneBudget(tier = {}) {
  const low = tier.tier === "low";
  const mobile = Boolean(tier.mobile);
  const medium = tier.tier === "medium";
  return {
    grassDistance: mobile ? 38 : low ? 55 : medium ? 85 : 120,
    treeDistance: mobile ? 95 : low ? 125 : medium ? 175 : 245,
    npcDistance: mobile ? 70 : low ? 95 : medium ? 135 : 180,
    particleLimit: mobile ? 36 : low ? 60 : medium ? 130 : 220,
    shadowMode: low || mobile ? "off" : medium ? "simple" : "soft",
    cssBlur: !mobile && !low,
    maxDistantActors: mobile ? 18 : low ? 26 : medium ? 42 : 70,
  };
}

export default fastSceneBudget;
