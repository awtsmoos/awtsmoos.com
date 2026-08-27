// B"H
export class InteractionPlan { static make(type, actor, objectId, options = {}) { return { type: 'interaction', interactionType: type, actor, objectId, ...options }; } }
