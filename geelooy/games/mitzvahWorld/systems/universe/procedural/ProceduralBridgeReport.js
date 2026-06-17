// B"H
export function proceduralBridgeReport(packets = []) { return { packets:packets.length, ok:packets.filter(p=>p.ok).length, failed:packets.filter(p=>p.ok===false).length, primitives:packets.reduce((a,p)=>{ const k=p.result?.geometry?.primitive || "unknown"; a[k]=(a[k]||0)+1; return a; }, {}) }; }
