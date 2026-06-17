// B"H
export function sefirosCinematicReport(queue = {}) { return { packets:queue.packets?.length || 0, byKind:(queue.packets || []).reduce((a,p)=>{ a[p.packetKind]=(a[p.packetKind]||0)+1; return a; }, {}) }; }
export default sefirosCinematicReport;
