// B"H
export function cutsceneRouteReport(packets = []) { return { packets:packets.length, byKind:packets.reduce((a,p)=>{ a[p.kind]=(a[p.kind]||0)+1; return a; }, {}) }; }
export default cutsceneRouteReport;
