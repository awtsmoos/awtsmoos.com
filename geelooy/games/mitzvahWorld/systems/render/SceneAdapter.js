// B"H
/** Scene operations as data so renderers stay replaceable. */
export function sceneAddCommand(object = {}) { return { adapter:"scene", op:"add", object }; }
export function sceneTagCommand(key, value) { return { adapter:"scene", op:"tag", key, value }; }
export function sceneBatch(commands = []) { return { adapter:"scene", op:"batch", commands }; }
