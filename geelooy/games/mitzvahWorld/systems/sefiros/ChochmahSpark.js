// B"H
import { sefirahPacket } from "./SefirahPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function chochmahSpark(id, insight = {}) { return sefirahPacket("chochmah", "spark", { id, insight }); }
