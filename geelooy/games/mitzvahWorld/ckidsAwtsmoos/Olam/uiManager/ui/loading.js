// B"H
/**
 * @file loading.js
 * @description
 * Chapter 431: the loading screen becomes a living instrument panel.
 * The Awtsmoos returns the old moving vortex, then adds total, world, worker,
 * and texture bars so every long creation phase speaks in visible vessels.
 */
const stage = (label, barId, textId) => ({
  className: "genesis-stage-row",
  children: [
    { className: "genesis-stage-label", textContent: label },
    { className: "genesis-stage-track", child: { className: "genesis-stage-fill", id: barId } },
    { className: "genesis-stage-note", id: textId, textContent: "waiting" }
  ]
});
export default {
  shaym: "loading",
  className: "loading hidden",
  children: [
    { className: "kabbalah-vortex", children: [
      { className: "sefirot-ring ring-1" }, { className: "sefirot-ring ring-2" },
      { className: "sefirot-ring ring-3" }, { className: "sefirot-ring ring-4" },
      { className: "sefirot-ring ring-5" }, { className: "sefirot-ring ring-6" }
    ] },
    { className: "loading-stars", children: Array.from({ length: 18 }, (_, i) => ({ className: `loading-star s${i}` })) },
    { shaym: "loadingContent", className: "loadingContent", children: [
      { className: "loading-radial-core", children: [
        { className: "radial-percent", id: "genesisPercentText", textContent: "0%" },
        { className: "radial-caption", textContent: "continuous emanation" }
      ] },
      { tag: "h1", className: "awtsmoos-title-glow glitch-effect", textContent: "MITZVAH WORLD", attributes: { "data-text": "MITZVAH WORLD" } },
      { className: "barLoading", children: [{ shaym: "bar background", className: "bck", child: { shaym: "loading bar", id: "genesisProgressBar", className: "barMitzvah", child: { className: "light-spark-comet" } } }] },
      { className: "genesis-stage-panel", children: [
        stage("World", "genesisWorldBar", "genesisSubActionText"),
        stage("Worker", "genesisWorkerBar", "genesisWorkerText"),
        stage("Textures", "genesisTextureBar", "genesisTextureText")
      ] },
      { tag: "h2", className: "txtLoad pulse-text", id: "genesisMainLoadingText", textContent: "Drawing Down the Infinite Light..." },
      { tag: "h3", className: "txtLoad info", shaym: "action loading", id: "genesisActionText", textContent: "Forging Vessels..." },
      { className: "genesis-progress-log", id: "genesisProgressLog", children: [{ textContent: "B\"H  opening loading channel" }] }
    ] }
  ]
};
