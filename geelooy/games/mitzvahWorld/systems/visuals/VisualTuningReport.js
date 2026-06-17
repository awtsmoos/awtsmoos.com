// B"H
export function visualTuningReport(result = {}) { return { atmosphere:result.atmosphere || null, rtxFeeling:result.rtxFeeling || null, trees:result.trees || { touched:0 }, scene:result.scene || null }; }
export default visualTuningReport;
