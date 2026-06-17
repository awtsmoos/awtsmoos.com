// B"H
export function cinematicPacketReport(packets = []) { return { total:packets.length, byKind:packets.reduce((a,p)=>{ a[p.kind]=(a[p.kind]||0)+1; return a; }, {}) }; }
export default cinematicPacketReport;
