// B"H
export function cutsceneTrack(name, beats = []) { return { name, beats:beats.sort((a,b)=>(a.at||0)-(b.at||0)) }; }
export function trackDuration(track = {}) { return Math.max(0, ...(track.beats || []).map(b => (b.at || 0) + (b.payload?.duration || 0))); }
