// B"H
export function sefirosCinematicPacket(packet = {}) { return { sefirah:"hod", kind:"sefiros_cinematic_packet", packetKind:packet.kind, at:packet.at || 0, payload:packet }; }
export default sefirosCinematicPacket;
