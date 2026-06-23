/* B"H */
export function createCaptionExporter(input = {}) { return { kind:'CaptionExporter', format:input.format || 'vtt' }; }
export function exportVtt(track) { return ['WEBVTT', '', ...track.cues.flatMap((c, i) => [`${i+1}`, `${fmt(c.start)} --> ${fmt(c.end)}`, c.text, ''])].join('\n'); }
function fmt(t) { const s = Number(t || 0); const hh = String(Math.floor(s/3600)).padStart(2,'0'); const mm = String(Math.floor(s%3600/60)).padStart(2,'0'); const ss = (s%60).toFixed(3).padStart(6,'0'); return `${hh}:${mm}:${ss}`; }
