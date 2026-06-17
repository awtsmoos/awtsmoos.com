// B"H
export function cutsceneDirectorReport(scene = {}) { return { scene:scene.id || null, beats:scene.beats?.length || 0, consequences:scene.consequences?.length || 0, predictedTracks:[...new Set((scene.beats || []).map(b => b.kind))].length }; }
export default cutsceneDirectorReport;
