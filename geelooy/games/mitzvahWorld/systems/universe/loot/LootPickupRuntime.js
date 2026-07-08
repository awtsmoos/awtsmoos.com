// B"H
import { lootDropPackets } from "./LootDropPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class LootPickupRuntime { constructor() { this.picked = []; } pickup(sourceId, items = []) { const drops = lootDropPackets(sourceId, items); this.picked.push(...drops); return drops; } snapshot() { return { picked:this.picked.length, drops:this.picked }; } }
export default LootPickupRuntime;
