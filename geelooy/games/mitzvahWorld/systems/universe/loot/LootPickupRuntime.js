// B"H
import { lootDropPackets } from "./LootDropPacket.js";
export class LootPickupRuntime { constructor() { this.picked = []; } pickup(sourceId, items = []) { const drops = lootDropPackets(sourceId, items); this.picked.push(...drops); return drops; } snapshot() { return { picked:this.picked.length, drops:this.picked }; } }
export default LootPickupRuntime;
