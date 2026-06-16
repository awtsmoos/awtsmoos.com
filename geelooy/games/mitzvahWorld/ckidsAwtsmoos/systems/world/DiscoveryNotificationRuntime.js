// B"H
/** @file DiscoveryNotificationRuntime.js @description Discovery overlay/chat payloads. */
export function notifyDiscovery(olam, landmark) { const text = `DISCOVERED: ${landmark.title}`; olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color: "#ffd700" }); olam?.ayshPeula?.("ui event", "chatPanel", { append: { tab: "System", text } }); return text; }
export default { notifyDiscovery };
