// B"H
export class ObjectSpawnPlanner { static plan(id, mode = 'slide', from = {}, to = {}) { return { type: 'object', id, objectAction: mode, from, to, lifecycle: 'introduced' }; } }
