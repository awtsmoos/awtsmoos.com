// B"H
/** @file RareAnnouncementRuntime.js @description Silver-dragon style rare-spawn announcement payloads. */
export function announceRare(olam, rare) { if (!rare) return false; const payload = { id:rare.id, name:rare.name, text:`Rare sighted: ${rare.name}`, frame:"silver-dragon" }; olam?.ayshPeula?.("ui event", "rareAnnouncement", payload); return payload; }
export default { announceRare };
