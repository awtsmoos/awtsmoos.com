// B"H
/**
 * @class ProceduralTextureInterceptor
 * @description
 * Chapter 436: awtsmoostex URLs report their descent into cached form.
 */
function report(stage, url) { try { globalThis.dispatchEvent?.(new CustomEvent("awtsmoos-texture-progress", { detail: { stage, type: String(url || "").replace(/^awtsmoostex:\/\//i, ""), percent: stage === "intercepted" ? 18 : 100 } })); } catch (_) {} }
export default class ProceduralTextureInterceptor {
  static async intercept(url) {
    if (typeof url !== "string" || !url.toLowerCase().startsWith("awtsmoostex://")) return url;
    try {
      report("intercepted", url);
      const TextureForge = (await import("../../../../utils/TextureForge/index.js?compact=true&v=texture-idb-20260614-bh1")).default;
      const finalUrl = await TextureForge.generate(url.substring(14));
      report("intercept-complete", url);
      return finalUrl;
    } catch (error) {
      report("intercept-failed", url);
      console.error("B\"H: Procedural Texture Forge encountered harsh judgments during interception.", error);
      return url;
    }
  }
}
