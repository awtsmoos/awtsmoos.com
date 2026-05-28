// B"H
/**
 * @file effectsOverlay.js
 * @description
 * Chapter 12: The reset veil waits after the blast.
 *
 * The Awtsmoos tears open the thorn moment: first sparks, then silence, then the
 * command to begin again. This overlay does not reload instantly. It lets the
 * worker hide the player, waits for the flash, and only then shows the gate:
 * press any key or click, and the level returns to the starting point.
 */

const LETTERS = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע"];

function particle(parent, text, className, ms = 1600) {
  if (!parent?.appendChild) return;
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

function floatingText(parent, data) {
  if (!parent?.appendChild || !data?.text) return;
  const el = document.createElement("div");
  el.className = "floating-text";
  el.textContent = data.text;
  el.style.color = data.color || "white";
  el.style.left = `${window.innerWidth / 2}px`;
  el.style.top = `${window.innerHeight / 2}px`;
  parent.appendChild(el);
  setTimeout(() => el.remove(), data.effect === "spikeDeath" ? 4500 : 1600);
}

function installResetGate(parent) {
  if (!parent?.appendChild || parent.__awtsmoosResetGate) return;
  parent.__awtsmoosResetGate = true;
  const gate = document.createElement("div");
  gate.className = "awtsmoos-reset-gate";
  gate.style.pointerEvents = "auto";
  gate.innerHTML = `<div class="reset-title">נפילה בקוצים</div><div class="reset-subtitle">PRESS ANY KEY / CLICK TO RESET</div>`;
  parent.appendChild(gate);

  const reset = () => globalThis.location.reload();
  window.addEventListener("keydown", reset, { once: true });
  window.addEventListener("mousedown", reset, { once: true });
  window.addEventListener("touchstart", reset, { once: true });
}

function burstLetters(parent, effect) {
  const amount = effect === "spikeDeath" ? 64 : 12;
  for (let i = 0; i < amount; i += 1) {
    particle(parent, LETTERS[i % LETTERS.length], effect === "spikeDeath" ? "hebrew-particle spike" : "hebrew-particle");
  }
}

export default {
  shaym: "effectsOverlay",
  className: "effects-overlay",
  style: { pointerEvents: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2000 },
  on: {
    awtsmoosRevealed(e) {
      const data = e.detail || {};
      const parent = e.target;
      floatingText(parent, data);
      if (data.effect === "transaction" || data.effect === "spikeDeath") burstLetters(parent, data.effect);
      if (data.effect === "spikeDeath") setTimeout(() => installResetGate(parent), Number(data.overlayDelayMs) || 900);
      bridgeAudio(data);
    }
  }
};

function bridgeAudio(data) {
  if (data.playProceduralSound) {
    import("../../../../systems/audio/AudioEngine.js")
      .then(m => m.default.play(data.playProceduralSound.key, data.playProceduralSound.options))
      .catch(() => {});
  }
  if (data.triggerDynamicStep) {
    import("../../../../systems/audio/DynamicAudio.js").then(m => m.default.triggerStep()).catch(() => {});
  }
}
