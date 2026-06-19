// B"H
export class HandOffInteraction { static events({ from, to, objectId, start = 0, end = 1000 } = {}) { return [{ type: 'character', id: from, gesture: 'show', lookAt: to, start, end }, { type: 'character', id: to, gesture: 'receive', lookAt: objectId, start, end }, { type: 'prop', id: objectId, action: 'slide', from: { x: 20, y: 104 }, to: { x: -28, y: 104 }, start, end }]; } }
