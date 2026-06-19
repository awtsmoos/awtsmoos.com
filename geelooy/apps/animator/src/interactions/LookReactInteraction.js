// B"H
export class LookReactInteraction { static events({ actors = [], objectId, start = 0, end = 800 } = {}) { return actors.map(id => ({ type: 'character', id, lookAt: objectId, attentionTarget: { id: objectId, kind: 'prop' }, gesture: 'react_nod', start, end })); } }
