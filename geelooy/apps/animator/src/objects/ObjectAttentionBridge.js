// B"H
export class ObjectAttentionBridge { static eventFor(objectId, actors = []) { return actors.map(id => ({ type: 'character', id, lookAt: objectId, attentionTarget: { id: objectId, kind: 'prop' } })); } }
