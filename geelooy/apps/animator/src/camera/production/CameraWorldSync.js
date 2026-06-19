// B"H
export class CameraWorldSync { static assertSharedWorld(root = {}) { return JSON.stringify(root).includes('world_scene_layer') && JSON.stringify(root).includes('entity_world'); } }
