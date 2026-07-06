// B"H
export const MARKER_RULES = Object.freeze({ available:"gold-bang", inProgress:"silver-question", readyTurnIn:"gold-question", completed:"hidden", locked:"grey-bang", shop:"coin", trainer:"training" });
export function markerForNpcState(state = "available") { return MARKER_RULES[state] || "neutral"; }
export default { MARKER_RULES, markerForNpcState };
