// B"H
/**
 * @file loadingPlain.js
 * @description Chapter 91: fresh boot-safe loading methods. The Awtsmoos moves
 * loading into a new filename so the public server cannot serve the stale
 * AssetCache-importing vessel during mobile worker boot.
 */
export default class LoadingPlainMethods {
  $gc(shaym) { return this.getComponent(shaym); }

  async loadComponent(shaym, url, onProgress) {
    if (typeof url !== "string") {
      this.components[shaym] = url;
      return shaym;
    }
    this.componentSourceUrls ||= {};
    this.componentSourceUrls[shaym] = url;
    const response = await this.fetchWithProgress(url, null, { onProgress: p => { if (typeof onProgress === "function") onProgress(p); } });
    if (!response.ok) throw new Error(`B"H Error: The Speech at "${url}" was not spoken correctly. Status: ${response.status}`);
    this.components[shaym] = URL.createObjectURL(await response.blob());
    return shaym;
  }

  async loadComponents(components = {}) {
    const entries = Object.entries(components);
    if (!entries.length) return;
    let loadedCount = 0;
    await Promise.all(entries.map(async ([shaym, url]) => {
      try { await this.loadComponent(shaym, url); }
      catch (error) { console.warn(`B"H - Vessel ${shaym} failed to manifest, continuing...`, error); }
      loadedCount += 1;
      this.ayshPeula("increase loading percentage", {
        total:(loadedCount / entries.length) * 100,
        reset:false,
        action:"Drawing Light...",
        subAction:`Manifesting Vessel: ${shaym}`
      });
    }));
  }

  getComponent(shaym) {
    if (typeof shaym !== "string") return undefined;
    const resolvePath = (obj, lookup) => lookup.split("/").reduce((cur, key) => cur && typeof cur === "object" ? cur[key] : undefined, obj);
    if (shaym.startsWith("awtsmoos://")) return this.resolveComponentPath(shaym.slice(11), resolvePath, this.components);
    if (shaym.startsWith("awtsmoos.vars")) return this.resolveComponentPath(shaym.slice(16), resolvePath, this.vars);
    return undefined;
  }

  resolveComponentPath(lookup, resolvePath, source) {
    const baseKey = lookup.split("/")[0];
    const base = source[baseKey];
    if (!base) return undefined;
    if (typeof base === "string") return base;
    return lookup.includes("/") ? resolvePath(base, lookup.slice(baseKey.length + 1)) : base;
  }

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
