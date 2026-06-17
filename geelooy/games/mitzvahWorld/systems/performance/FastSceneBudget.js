// B"H
export function fastSceneBudget(tier = {}) { return { grassDistance:tier.mobile ? 55 : 110, treeDistance:tier.mobile ? 140 : 260, npcDistance:tier.mobile ? 95 : 180, particleLimit:tier.mobile ? 80 : 260, shadowMode:tier.tier === "high" ? "soft" : tier.tier === "medium" ? "simple" : "off", cssBlur:!tier.mobile && tier.tier !== "low" }; }
export default fastSceneBudget;
