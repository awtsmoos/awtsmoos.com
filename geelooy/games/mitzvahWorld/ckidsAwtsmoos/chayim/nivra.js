/**
 * B"H
 * @file nivra.js
 * @description Parser-plain compact Nivra base class for worker boot.
 */
import Heeoolee from "./heeooleey.js?compact=true&v=tree-nan-doorway-compact-20260708-bh2";
let nivrayimMade = 0;
export default class Nivra extends Heeoolee {
  constructor(options = {}) { super(); this.isReady = false; this.type = "nivra"; this.serialized = {}; this.name = options.name || "nivra_" + nivrayimMade; nivrayimMade += 1; this.shlichus = options.shlichus || null; this.placeholderName = options.placeholderName || this.name; this.bindOptionEvents(options.on); }
  bindOptionEvents(on) { if (!on || typeof on !== "object") return; Object.keys(on).forEach(key => { if (typeof on[key] === "function") this.on(key, on[key]); }); }
  async ready() { this.ayshPeula("ready", this); this.isReady = true; }
  async afterBriyah() { this.ayshPeula("afterBriyah", this); }
  async hasShlichus() { const d = this.dialogue && this.dialogue.shlichuseem; if (!this.olam || typeof this.olam.ayshPeula !== "function") return false; return await this.olam.ayshPeula("is shlichus available", d); }
  serialize() { const out = { ...(this.serialized || {}) }; out.name = this.name; this.serialized = out; return out; }
  async heescheel(olam) { this.ayshPeula("heescheel", this, olam); }
  heesHawvoos(deltaTime) {}
}
