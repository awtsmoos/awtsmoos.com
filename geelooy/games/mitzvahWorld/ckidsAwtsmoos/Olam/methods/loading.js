// B"H
/**
 * @file loading.js
 * @description Chapter 90: loading no longer imports AssetCache during worker
 * boot. The Awtsmoos exposed a Linux case wound in `utils/AssetCache.js`; this
 * vessel now fetches directly and keeps OlamVessel's import graph free from
 * cache helpers until the world has already survived birth.
 */
export default class LoadingMethods {
  /** @param {string} shaym Component name. @returns {unknown} Component. */
  $gc(shaym) { return this.getComponent(shaym); }

  /** @param {string} shaym Name. @param {string|unknown} url Source. @param {Function} onProgress Progress. @returns {Promise<string>} */
  async loadComponent(shaym, url, onProgress) {
    if (typeof url !== "string") {
      this.components[shaym] = url;
      return shaym;
    }
    this.componentSourceUrls ||= {};
    this.componentSourceUrls[shaym] = url;
    const response = await this.fetchWithProgress(url, null, { onProgress: p => { if (typeof onProgress === "function") onProgress(p); } });
    if (!response.ok) throw new Error(`B"H Error: The Speech at "${url}" was not spoken correctly. Status: ${response.status}`);
    const blob = await response.blob();
    this.components[shaym] = URL.createObjectURL(blob);
    return shaym;
  }

  /** @param {object} components Components map. @returns {Promise<void>} */
  async loadComponents(components = {}) {
    const entries = Object.entries(components);
    const totalFiles = entries.length;
    if (totalFiles === 0) return;
    let loadedCount = 0;
    await Promise.all(entries.map(async ([shaym, url]) => {
      try { await this.loadComponent(shaym, url); }
      catch (error) { console.warn(`B"H - Vessel ${shaym} failed to manifest, continuing...`, error); }
      loadedCount += 1;
      this.ayshPeula("increase loading percentage", { amount: (loadedCount / totalFiles) * 100, reset: true, action: "Drawing Light...", subAction: `Manifesting Vessel: ${shaym}` });
    }));
  }

  /** @param {string} shaym Lookup path. @returns {unknown} */
  getComponent(shaym) {
    if (typeof shaym !== "string") return undefined;
    const resolvePath = (obj, lookup) => {
      let current = obj;
      for (const key of lookup.split("/")) {
        if (current == null || typeof current !== "object") return undefined;
        current = current[key];
      }
      return current;
    };
    if (shaym.startsWith("awtsmoos://")) {
      const lookup = shaym.slice(11);
      const baseKey = lookup.split("/")[0];
      const baseComponent = this.components[baseKey];
      if (!baseComponent) return undefined;
      if (typeof baseComponent === "string") return baseComponent;
      return lookup.includes("/") ? resolvePath(baseComponent, lookup.slice(baseKey.length + 1)) : baseComponent;
    }
    if (shaym.startsWith("awtsmoos.vars")) {
      const lookup = shaym.slice(16);
      const baseKey = lookup.split("/")[0];
      const baseVar = this.vars[baseKey];
      if (!baseVar) return undefined;
      if (typeof baseVar === "string") return baseVar;
      return lookup.includes("/") ? resolvePath(baseVar, lookup.slice(baseKey.length + 1)) : baseVar;
    }
    return undefined;
  }

  /** @param {object} modules Module map. @returns {Promise<object>} Loaded modules. */
  async getModules(modules = {}) {
    const getModulesInValue = async source => {
      const added = {};
      for (const key of Object.keys(source)) {
        const value = source[key];
        if (typeof value === "object" && value !== null) added[key] = await getModulesInValue(value);
        else if (typeof value === "string") added[key] = await this.getModule(value, { name: key });
      }
      return added;
    };
    const mods = await getModulesInValue(modules);
    if (mods) this.modules = { ...this.modules, ...mods };
    return mods;
  }

  /** @param {string} href Module URL. @param {{name:string}} options Label. @returns {Promise<unknown>} */
  async getModule(href, { name }) {
    if (typeof href !== "string") return null;
    try { return (await import(href))?.default; }
    catch (error) { console.error(`B"H - Module load error: ${name}`, error); return null; }
  }

  setAsset(shaym, data) { this.assets[shaym] = data; }
  getAsset(shaym) { return this.assets[shaym] || null; }
  $ga(shaym) { return this.getAsset(shaym); }
  setAssets(assets = {}) { Object.assign(this.assets, assets); }
}
