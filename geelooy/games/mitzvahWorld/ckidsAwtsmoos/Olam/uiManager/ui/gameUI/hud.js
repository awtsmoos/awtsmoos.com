// B"H
/**
 * @file hud.js
 * @description
 * Chapter 11: The HUD counts like a cheerful desert cashier.
 *
 * The Awtsmoos renews each number as a fresh creation. The worker sends the
 * count; the main thread paints it. If storage is absent, the HUD still counts
 * from the event payload and never silently freezes at 0.
 */
function readGlobalCoins() {
  try {
    return Number(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins") || 0);
  } catch {
    return 0;
  }
}

function writeGlobalCoins(value) {
  try {
    globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(value));
  } catch {}
}

function numberFrom(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default {
  shaym: "gameHUD",
  className: "game-hud desert-hud",
  on: {
    awtsmoosRevealed(e, $, ui) {
      const globalText = $("hud-global-coins");
      if (globalText) globalText.textContent = `Global: ${readGlobalCoins()}`;
      this.dataset.collectedPerutos = this.dataset.collectedPerutos || "0";
    },

    levelGoal(e, $, ui) {
      const data = e.detail || {};
      const goal = numberFrom(data.requiredPerutos, 0);
      const goalText = $("hud-perutah-goal");
      const bar = $("hud-perutah-bar");
      const status = $("hud-perutah-status");
      if (goalText) goalText.textContent = `Perutos: 0 / ${goal}`;
      if (bar) bar.style.width = "0%";
      if (status) status.textContent = "Collect Perutos";
      this.dataset.requiredPerutos = String(goal);
      this.dataset.collectedPerutos = "0";
    },

    perutahProgress(e, $, ui) {
      const data = e.detail || {};
      const required = numberFrom(this.dataset.requiredPerutos || data.requiredPerutos, 7);
      const oldCollected = numberFrom(this.dataset.collectedPerutos, 0);
      const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : oldCollected + numberFrom(data.added, 1);
      const percent = required > 0 ? Math.min(100, (collected / required) * 100) : 0;
      const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + numberFrom(data.globalAdded, 0);
      writeGlobalCoins(globalCoins);

      const goalText = $("hud-perutah-goal");
      const globalText = $("hud-global-coins");
      const bar = $("hud-perutah-bar");
      const status = $("hud-perutah-status");

      this.dataset.collectedPerutos = String(collected);
      if (goalText) goalText.textContent = `Perutos: ${collected} / ${required}`;
      if (globalText) globalText.textContent = `Global: ${globalCoins}`;
      if (bar) bar.style.width = percent + "%";
      if (status) {
        status.textContent = collected >= required
          ? "Gate ready — zing!"
          : `${data.funnyText || "Perutah ping!"} Need ${Math.max(0, required - collected)} more`;
      }
    },

    tooltip(e, $, ui) {
      const data = e.detail || {};
      const tt = $("tooltip");
      if (!tt) return;
      tt.textContent = data.text || "";
      tt.classList.toggle("hidden", !data.show);
    }
  },
  children: [
    {
      className: "desert-progress-card",
      style: {
        position: "absolute",
        top: "16px",
        left: "16px",
        zIndex: 1000,
        width: "282px",
        padding: "10px 12px",
        borderRadius: "14px",
        background: "rgba(30, 18, 8, 0.72)",
        border: "1px solid rgba(255, 210, 100, 0.55)",
        color: "#ffe9a8",
        fontFamily: "Fredoka, sans-serif",
        boxShadow: "0 0 20px rgba(255, 183, 0, 0.25)"
      },
      children: [
        { shaym: "hud-perutah-goal", className: "hud-text", textContent: "Perutos: 0 / ?" },
        {
          className: "hud-bar-container",
          style: { marginTop: "6px", height: "12px", background: "rgba(255,255,255,0.16)", borderRadius: "999px", overflow: "hidden" },
          children: [
            { shaym: "hud-perutah-bar", className: "hud-bar", style: { width: "0%", height: "100%", background: "linear-gradient(90deg,#ffb000,#fff176)", transition: "width .25s" } }
          ]
        },
        { shaym: "hud-perutah-status", style: { marginTop: "4px", fontSize: "12px", color: "#fff8d4" }, textContent: "Collect Perutos" },
        { shaym: "hud-global-coins", style: { marginTop: "4px", fontSize: "13px", color: "#ffd166" }, textContent: "Global: 0" }
      ]
    },
    { shaym: "tooltip", className: "tooltip hidden" }
  ]
};
