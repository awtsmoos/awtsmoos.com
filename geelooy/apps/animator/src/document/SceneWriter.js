// B"H
export class SceneWriter { static write(doc) { return JSON.stringify(doc?.toJSON?.() || doc, null, 2); } }
