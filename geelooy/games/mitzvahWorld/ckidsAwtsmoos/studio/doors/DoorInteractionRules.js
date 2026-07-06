// B"H
export function createDoorInteractionRules(input = {}) { return { clickableMobile:true, clickableDesktop:true, highlight:true, prompt:input.prompt || "Open", openAnimation:"swing", collisionChanges:true }; }
export default { createDoorInteractionRules };
