// B"H
/**
 * @file DialogueUI.js
 * @description Chapter 444: speech descends from a wall into a bottom-sheet.
 * The NPC remains visible, the world keeps breathing, and the Awtsmoos speaks
 * through compact choices instead of a screen-eating palace.
 */
function responseButton(response, index) {
  return {
    tag: "button",
    className: "dialogue-response-btn",
    text: response?.text || response?.label || "Continue",
    style: {
      border: "1px solid rgba(255,216,104,.55)", borderRadius: "12px", padding: "10px 12px",
      background: "linear-gradient(135deg, rgba(110,70,220,.92), rgba(216,126,32,.92))", color: "#fff",
      fontWeight: "900", fontSize: "14px", minHeight: "40px", touchAction: "manipulation"
    },
    events: { click: () => response?.onChoose?.(index) }
  };
}
export class DialogueUI {
  static generate({ npcName = "Guide", message = "", responses = [], onChoice = null } = {}) {
    const choices = Array.isArray(responses) ? responses.map((response, index) => ({ ...response, onChoose: onChoice })) : [];
    return {
      shaym: "dialogue-vessel",
      methods: { classList: { remove: "hidden" } },
      children: [{
        className: "premium-dialogue-container",
        style: {
          position: "fixed", left: "50%", bottom: "24px", transform: "translateX(-50%)", zIndex: "9100",
          width: "min(92vw, 640px)", maxHeight: "46vh", overflow: "auto", display: "flex", flexDirection: "column",
          gap: "10px", padding: "14px", borderRadius: "18px", border: "1px solid rgba(255,216,104,.55)",
          background: "rgba(7,10,14,.9)", color: "#f7f0d8", boxShadow: "0 8px 18px rgba(0,0,0,.32)",
          fontFamily: "Inter, system-ui, sans-serif", backdropFilter: "none"
        },
        children: [
          { tag: "h2", text: npcName, style: { margin: "0", fontSize: "18px", lineHeight: "1.1", color: "#ffe68a", textShadow: "0 1px 2px #000" } },
          { tag: "p", className: "dialogue-text", text: message, style: { margin: "0", fontSize: "15px", lineHeight: "1.35", fontWeight: "700", color: "#fff7df" } },
          { className: "dialogue-responses", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "8px" }, children: choices.map(responseButton) }
        ]
      }]
    };
  }
}
export default DialogueUI;
