// B"H
import { sefirosCinematicPacket } from "./SefirosCinematicPacket.js";
export function sefirosCinematicQueue(packets = []) { return { kind:"sefiros_cinematic_queue", packets:packets.map(sefirosCinematicPacket), total:packets.length }; }
export default sefirosCinematicQueue;
