// B"H
export class PerformanceInspectorModel { static inspect(character = {}) { return { id: character.id, emotion: character.emotion, facePose: character.facePose, performancePose: character.performancePose, editable: ['emotion', 'speechEnergy', 'gesture', 'lookAt'] }; } }
