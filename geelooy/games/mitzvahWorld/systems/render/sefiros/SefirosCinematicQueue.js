// B"H
import { sefirosCinematicPacket } from "./SefirosCinematicPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function sefirosCinematicQueue(packets = []) { return { kind:"sefiros_cinematic_queue", packets:packets.map(sefirosCinematicPacket), total:packets.length }; }
export default sefirosCinematicQueue;
