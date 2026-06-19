// B"H
export class BiteInteraction { static events({ actor, objectId, start = 0, end = 1000 } = {}) { return [{ type: 'character', id: actor, gesture: 'bite', heldPropId: objectId, emotion: 'happy', start, end }, { type: 'prop', id: objectId, action: 'bite', lifecycle: 'consumed', start, end }]; } }
