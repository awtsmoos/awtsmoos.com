// B"H
/**
 * @file effectsOverlay.js
 * @description
 * Chapter 6: Main-thread sparks for spike death.
 *
 * The worker asks for `effect: spikeDeath`; this overlay shows Hebrew letters,
 * a clear reset instruction, and reloads on the next key, click, or touch.
 */

const LETTERS = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע"];

function particle(parent, text, className, ms = 1600) {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  el.style.left = "50%";
  el.style.top = "50%";
  el.style.setProperty('--tx', `${Math.random() * 520 - 260}px`);
  el.style.setProperty('--ty', `${Math.random() * 420 - 250}px`);
  parent.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

function installResetGate(parent) {
  if (parent.__awtsmoosResetGate) return;
  parent.__awtsmoosResetGate = true;
  const gate = document.createElement("div");
  gate.className = "awtsmoos-reset-gate";
  gate.innerHTML = `<div class="reset-title">נפילה בקוצים</div><div class="reset-subtitle">PRESS ANY KEY / CLICK TO RESET</div>`;
  parent.appendChild(gate);

  const reset = () => globalThis.location.reload();
  window.addEventListener("keydown", reset, { once: true });
  window.addEventListener("mousedown", reset, { once: true });
  window.addEventListener("touchstart", reset, { once: true });
}

export default {
  shaym: "effectsOverlay",
  className: "effects-overlay",
  style: { pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2000 },
  on: {
    awtsmoosRevealed(e) {
      const data = e.detail || {};
      if (data.text) {
        const el = document.createElement("div");
        el.className = "floating-text";
        el.textContent = data.text;
        el.style.color = data.color || "white";
        el.style.left = `${window.innerWidth / 2}px`;
        el.style.top = `${window.innerHeight / 2}px`;
        e.target.appendChild(el);
        setTimeout(() => el.remove(), data.effect === "spikeDeath" ? 4500 : 2000);
      }

      if (data.effect === "transaction" || data.effect === "spikeDeath") {
        const amount = data.effect === "spikeDeath" ? 52 : 20;
        for (let i = 0; i < amount; i += 1) {
          particle(e.target, LETTERS[i % LETTERS.length], data.effect === "spikeDeath" ? "hebrew-particle spike" : "hebrew-particle");
        }
      }

      if (data.effect === "spikeDeath") installResetGate(e.target);
      bridgeAudio(data);
    }
  }
};

function bridgeAudio(data) {
  if (data.playProceduralSound) {
    import("../../../../systems/audio/AudioEngine.js")
      .then(m => m.default.play(data.playProceduralSound.key, data.playProceduralSound.options))
      .catch(err => console.warn("B\"H Audio failed to bridge:", err));
  }
  if (data.triggerDynamicJump !== undefined) {
    import("../../../../systems/audio/DynamicAudio.js").then(m => m.default.triggerJump(data.triggerDynamicJump)).catch(() => {});
  }
  if (data.triggerDynamicImpact !== undefined) {
    import("../../../../systems/audio/DynamicAudio.js").then(m => m.default.triggerImpact(data.triggerDynamicImpact)).catch(() => {});
  }
  if (data.triggerDynamicStep) {
    import("../../../../systems/audio/DynamicAudio.js").then(m => m.default.triggerStep()).catch(() => {});
  }
}
