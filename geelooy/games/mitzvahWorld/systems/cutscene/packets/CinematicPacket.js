// B"H
export function cinematicPacket(kind, id, at = 0, duration = 0, payload = {}, source = null) { return { kind, id:id || `${kind}_${at}`, at:Number(at)||0, duration:Number(duration)||0, payload, source }; }
export function cinematicPackets(items = []) { return items.map(i => cinematicPacket(i.kind, i.id, i.at, i.duration, i.payload, i.source)); }
export default cinematicPacket;
