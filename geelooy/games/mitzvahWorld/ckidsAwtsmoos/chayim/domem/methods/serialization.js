// B"H
/**
 * @file serialization.js
 * @description
 * Chapter 320: Asset size becomes a whisper, not a sword.
 *
 * The Awtsmoos lets remote GLB probes fail quietly on mobile. Size is only a
 * loading-progress hint; it must never throw through creation or summon a fatal
 * worker alert when fetch/DRACO/network refuses the request.
 */
import Utils from '../../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import Nivra from "../../nivra.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default {
  getPath() {
    if (this.path && typeof this.path === "string") {
      let derech = this.path;
      if (this.path.startsWith('awtsmoos://')) {
        const component = this.olam.getComponent(this.path);
        if (!component) return "";
        derech = component;
        this.loadedPath = derech;
      }
      return derech;
    }
    return null;
  },

  async getSize() {
    const path = this.getPath();
    if (!path) return 0;
    try {
      const response = await fetch(path, { method: "HEAD", cache: "force-cache" });
      const size = Number.parseInt(response.headers.get("Content-Length") || "0", 10);
      return Number.isFinite(size) ? size : 0;
    } catch (error) {
      console.warn("B\"H | ASSET_SIZE_PROBE_NONFATAL", { name: this.name, type: this.type, path, reason: error?.message || String(error) });
      return 0;
    }
  },

  sealayk() {
    this.ayshPeula("sealayk");
  },

  serialize() {
    Nivra.prototype.serialize.call(this);
    this.serialized = { ...this.serialized };
    const optionKeys = Object.keys(this?.originalOptions || {});
    const original = ["on", "itemData", "dimensions"];
    const hasSmartMetadata = this.itemData || (this.originalOptions && this.originalOptions.itemData);
    for (const key of optionKeys) {
      if (key === "golem" && hasSmartMetadata) continue;
      let tried = this[key] || this.originalOptions[key];
      if (original.includes(key)) {
        this.serialized[key] = this.originalOptions[key] || this[key];
        if (key === "on") this.serialized[key] = Utils.stringifyFunctions(this.serialized[key]);
        continue;
      }
      if (typeof tried?.serialize === "function") tried = tried.serialize();
      this.serialized[key] = tried;
    }
    if (this.itemData) this.serialized.itemData = this.itemData;
    return this.serialized;
  }
};
