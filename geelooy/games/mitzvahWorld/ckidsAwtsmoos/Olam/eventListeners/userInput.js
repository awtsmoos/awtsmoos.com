// B"H
/**
 * @file userInput.js
 * @description
 * Chapter 68: The side buttons become explicit commands. The Awtsmoos keeps
 * run/walk state, adds a true first-person toggle, and lets the dock send the
 * player home to village without awakening builder side panels.
 */
import PointerUpdater from "../methods/interaction/PointerUpdater.js";

function toggleFPS(olam) {
  if (!olam?.ayin) return;
  olam.ayin.isFPS = !olam.ayin.isFPS;
  olam.ayshPeula("setFPS", olam.ayin.isFPS);
  olam.ayshPeula("ui event", "effectsOverlay", {
    text: olam.ayin.isFPS ? "First person" : "Third person",
    color: "#7dfcff"
  });
}

export default function userInputEvents() {
  let c;
  this.on("keydown", peula => {
    c = peula.code;
    if (!this.keyStates[peula.code]) this.ayshPeula("keypressed", peula);
    this.keyStates[peula.code] = true;
    if (this.keyBindings[c]) this.inputs[this.keyBindings[c]] = true;
  });

  this.on("setInput", peula => {
    c = peula.code;
    if (this.keyBindings[c]) this.inputs[this.keyBindings[c]] = true;
  });

  this.on("setInputOut", peula => {
    c = peula.code;
    if (this.keyBindings[c] && this.keyBindings[c] !== "RUNNING") this.inputs[this.keyBindings[c]] = false;
  });

  this.on("toggleFPS", () => toggleFPS(this));

  this.on("returnVillage", () => {
    this.ayshPeula("ui event", "navigateLevel", { next: "village.json", reason: "return village loses progress" });
  });

  this.on("setRunMode", peula => {
    const running = peula?.running !== false;
    this.inputs.RUNNING = running;
    this.runMode = running ? "run" : "walk";
    this.ayshPeula("ui event", "effectsOverlay", {
      text: running ? "Run Mode" : "Walk Mode",
      color: running ? "#76ff8a" : "#ffd966"
    });
  });

  this.on("keyup", peula => {
    c = peula.code;
    this.keyStates[peula.code] = false;
    if (this.keyBindings[c] && this.keyBindings[c] !== "RUNNING") this.inputs[this.keyBindings[c]] = false;
  });

  this.on("presskey", () => {});
  this.on("mousedown", peula => {
    if (peula.clientX !== undefined && peula.clientY !== undefined) PointerUpdater.update(this, peula.clientX, peula.clientY);
    this.ayin.onMouseDown(peula);
    this.mouseDown = true;
  });
  this.on("mouseup", peula => {
    this.ayshPeula("mouseRelease", true);
    this.ayin.onMouseUp(peula);
    this.mouseDown = false;
  });
  this.on("wheel", peula => { if (this.ayin && typeof this.ayin.zoom === 'function') this.ayin.zoom(peula.deltaY); });
}
