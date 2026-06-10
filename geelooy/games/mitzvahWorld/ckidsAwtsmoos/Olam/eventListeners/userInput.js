// B"H
/**
 * @file userInput.js
 * @description
 * Chapter 69: Olam writes every input breath into a visible ledger.
 *
 * This is the worker-side covenant: keydown, keyup, setInput, and direct mobile
 * packets all converge into `olam.inputs`. The Awtsmoos now leaves a compact
 * console trail so no future silence can pretend to be movement.
 */
import PointerUpdater from "../methods/interaction/PointerUpdater.js";

function trace(olam, stage, payload = {}) {
  olam.__movementTrace ||= [];
  olam.__movementTrace.push({ at: Date.now(), stage, ...payload });
  olam.__movementTrace = olam.__movementTrace.slice(-120);
  if (!payload.quiet) console.info('B"H | OLAM_INPUT_TRACE', { stage, ...payload });
}
function toggleFPS(olam) {
  if (!olam?.ayin) return;
  olam.ayin.isFPS = !olam.ayin.isFPS;
  olam.ayshPeula("setFPS", olam.ayin.isFPS);
  olam.ayshPeula("ui event", "effectsOverlay", { text: olam.ayin.isFPS ? "First person" : "Third person", color: "#7dfcff" });
}
function bindInput(olam, code, value, source, keepRunning = true) {
  if (!code) return;
  olam.keyStates[code] = value;
  const key = olam.keyBindings?.[code];
  if (!key) return trace(olam, `${source}-unbound`, { code });
  if (value === false && keepRunning && key === "RUNNING") return;
  olam.inputs[key] = value;
  trace(olam, source, { code, key, value, active: Object.keys(olam.inputs).filter(k => olam.inputs[k]) });
}

export default function userInputEvents() {
  this.on("keydown", peula => {
    const code = peula?.code;
    if (!this.keyStates[code]) this.ayshPeula("keypressed", peula);
    bindInput(this, code, true, "keydown");
  });

  this.on("setInput", peula => bindInput(this, peula?.code, true, "setInput"));
  this.on("setInputOut", peula => bindInput(this, peula?.code, false, "setInputOut"));
  this.on("toggleFPS", () => toggleFPS(this));
  this.on("returnVillage", () => this.ayshPeula("ui event", "navigateLevel", { next: "village.json", reason: "return village loses progress" }));

  this.on("setRunMode", peula => {
    const running = peula?.running !== false;
    this.inputs.RUNNING = running;
    this.runMode = running ? "run" : "walk";
    trace(this, "setRunMode", { running, active: Object.keys(this.inputs).filter(k => this.inputs[k]) });
    this.ayshPeula("ui event", "effectsOverlay", { text: running ? "Run Mode" : "Walk Mode", color: running ? "#76ff8a" : "#ffd966" });
  });

  this.on("keyup", peula => bindInput(this, peula?.code, false, "keyup"));
  this.on("presskey", () => {});
  this.on("mousedown", peula => {
    if (peula.clientX !== undefined && peula.clientY !== undefined) PointerUpdater.update(this, peula.clientX, peula.clientY);
    this.ayin.onMouseDown(peula);
    this.mouseDown = true;
  });
  this.on("mouseup", peula => { this.ayshPeula("mouseRelease", true); this.ayin.onMouseUp(peula); this.mouseDown = false; });
  this.on("wheel", peula => { if (this.ayin && typeof this.ayin.zoom === 'function') this.ayin.zoom(peula.deltaY); });
}
