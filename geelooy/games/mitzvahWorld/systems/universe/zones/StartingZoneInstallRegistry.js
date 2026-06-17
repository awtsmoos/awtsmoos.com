// B"H
export class StartingZoneInstallRegistry { constructor() { this.items = []; } add(kind, packet) { const row = { kind, packet, at:new Date().toISOString() }; this.items.push(row); return row; } addAll(kind, packets = []) { return packets.map(p => this.add(kind, p)); } snapshot() { return { total:this.items.length, byKind:this.items.reduce((a,i)=>{ a[i.kind]=(a[i.kind]||0)+1; return a; }, {}) }; } }
export default StartingZoneInstallRegistry;
