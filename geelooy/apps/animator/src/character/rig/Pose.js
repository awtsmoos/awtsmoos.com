// B"H
export class Pose { constructor(bones = {}) { this.bones = bones; } static neutral() { return new Pose(Object.fromEntries(['head','chest','handL','handR'].map(k => [k, { rotation: 0 }]))) } }
