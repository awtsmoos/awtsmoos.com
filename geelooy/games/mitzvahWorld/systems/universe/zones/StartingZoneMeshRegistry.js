// B"H
export class StartingZoneMeshRegistry { constructor() { this.meshes = new Map(); } add(packet) { this.meshes.set(packet.id, packet); return packet; } addAll(packets = []) { return packets.map(p => this.add(p)); } snapshot() { return { meshes:this.meshes.size, ids:[...this.meshes.keys()] }; } }
export default StartingZoneMeshRegistry;
