// B"H
/** @file loadNivrayim.js @description Legacy loader drinks from bh9 no-alert player export hub. */
import Utils from '../../utils.js';
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js?v=no-compact-engine-20260702-bh2';
export default class LegacyLoadNivrayim {
  async addObject(type, options = {}) {
    const Ctor = AWTSMOOS[type];
    if (!Ctor) { console.error(`B"H - Olam.addObject: Type "${type}" does not exist.`, { available:Object.keys(AWTSMOOS) }); return null; }
    const nivra = new Ctor(options, this);
    if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
    if (nivra.heescheel) await nivra.heescheel(this);
    if (nivra.ready) await nivra.ready();
    if (nivra.afterBriyah) await nivra.afterBriyah();
    return nivra;
  }
  async loadNivrayim(nivrayim) {
    try {
      const nivrayimMade = [];
      for (const [type, nivraOptions] of Object.entries(nivrayim || {})) {
        const isArray = Array.isArray(nivraOptions), entries = isArray ? nivraOptions : Object.entries(nivraOptions || {});
        for (const entry of entries) {
          const name = isArray ? entry.name : entry[0], options = isArray ? entry : entry[1];
          try { const evaledObject = Utils.evalStringifiedFunctions(options), Ctor = AWTSMOOS[type]; if (Ctor && typeof Ctor === "function") nivrayimMade.push(new Ctor({ name, ...evaledObject }, this)); else console.warn('B"H | LEGACY_INSTANTIATE_MISSING_TYPE', { type, available:Object.keys(AWTSMOOS) }); }
          catch (error) { console.error("B\"H - Error instantiating legacy nivra", options, error); }
        }
      }
      let totalSize = 0;
      for (const nivra of nivrayimMade) { nivra.olam = this; const assetSize = typeof nivra.getSize === 'function' ? await nivra.getSize() : 0; totalSize += assetSize; nivra.assetSize = assetSize; }
      this.totalSize = totalSize;
      for (const nivra of nivrayimMade) if (typeof nivra.heescheel === "function") await nivra.heescheel(this, { nivrayimMade });
      for (const nivra of nivrayimMade) if (nivra.madeAll) await nivra.madeAll(this);
      for (const nivra of nivrayimMade) await this.doPlaceholderAndEntityLogic(nivra);
      for (const nivra of nivrayimMade) if (nivra.ready) await nivra.ready();
      for (const nivra of nivrayimMade) if (nivra.afterBriyah) await nivra.afterBriyah();
      if (!this.enlightened && typeof this.ohr === 'function') this.ohr();
      return nivrayimMade || [];
    } catch (error) { console.error("B\"H - LEGACY LOAD FAILED: ", error); return []; }
  }
}
