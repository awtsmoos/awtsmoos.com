// B"H
export class ObjectLifecyclePanel { static model(object) { return { title: 'Object Life', objectId: object?.id, states: ['hidden', 'introduced', 'placed', 'held', 'consumed'] }; } }
