// B"H
export function cutsceneReport(scene = {}) { return { id:scene.id || null, duration:scene.timeline?.duration || 0, tracks:scene.timeline?.tracks?.length || 0, beats:(scene.timeline?.tracks||[]).reduce((n,t)=>n+(t.beats?.length||0),0), consequences:scene.consequences?.length || 0 }; }
export default cutsceneReport;
