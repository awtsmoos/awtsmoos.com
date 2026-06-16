// B"H
/** @file EventAnnouncementRuntime.js @description World, rare, dungeon, and festival announcements through compact UI/chat payloads. */
export function announceEvent(olam, event = {}) { const text = event.text || `EVENT: ${event.title || event.id || "World Event"}`; const payload = { id:event.id || "event", title:event.title || text, text, kind:event.kind || "world", color:event.color || "#ffcf45", at:Date.now() }; olam?.ayshPeula?.("ui event", "effectsOverlay", { text:payload.text, color:payload.color }); olam?.ayshPeula?.("ui event", "chatPanel", { append:{ tab:"General", text:payload.text } }); olam?.ayshPeula?.("ui event", "worldAnnouncement", payload); return payload; }
export function announceRare(olam, rare = {}) { return announceEvent(olam, { id:rare.id, title:rare.name, text:`Rare sighted: ${rare.name || rare.id}`, kind:"rare", color:"#c0c0ff" }); }
export function announceDungeon(olam, dungeon = {}) { return announceEvent(olam, { id:dungeon.id, title:dungeon.title, text:`Dungeon discovered: ${dungeon.title || dungeon.id}`, kind:"dungeon", color:"#d7c8ff" }); }
export default { announceEvent, announceRare, announceDungeon };
