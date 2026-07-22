import {
  GRASS_URLS,
  houseImageEntries
} from "./chunk-DK7VZS62.js";
import {
  PUBLIC_ASSET_ALIASES_URL,
  PUBLIC_ASSET_INVENTORY_URL,
  loadPublicMaterialUrl,
  preloadPublicMaterialImages,
  publicMaterialCacheStats,
  publicMaterialUrl
} from "./chunk-PERZ7G34.js";

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/OrganizedAssetQuery.js
var CATEGORY_TAGS = Object.freeze({
  architecture: ["brick", "roof", "stone", "wood"],
  botany: ["bark", "botanical", "flower", "leaf"],
  fabric: ["fabric"],
  metal: ["metal"],
  models: ["model"],
  pbr: ["pbr"],
  roads: ["terrain", "stone"],
  terrain: ["terrain"],
  water: ["water"],
  wood: ["bark", "wood"]
});
function validateOrganizedAssetCatalog(catalog) {
  if (catalog?.schema !== "awtsmoos-asset-organization/v1" || !Array.isArray(catalog.assets)) {
    throw new Error("Unsupported organized asset catalog.");
  }
  return Object.freeze({
    ...catalog,
    assets: Object.freeze(catalog.assets.map(enrichAsset))
  });
}
function organizedAssetCategories(assets) {
  const categories = {};
  for (const asset of assets) {
    for (const category of asset.categories) {
      categories[category] = (categories[category] || 0) + 1;
    }
  }
  return Object.freeze(categories);
}
function enrichAsset(asset) {
  const canonicalPath = asset.canonicalPath || asset.path;
  return Object.freeze({
    ...asset,
    canonicalPath,
    canonicalUrl: publicMaterialUrl(canonicalPath),
    categories: Object.freeze(assetCategories(asset)),
    previewHalfUrl: previewUrl(canonicalPath, "half-resolution"),
    previewQuarterUrl: previewUrl(canonicalPath, "quarter-resolution")
  });
}
function assetCategories(asset) {
  const tags = new Set(asset.tags || []);
  const categories = Object.entries(CATEGORY_TAGS).filter(([, required]) => required.some((tag) => tags.has(tag))).map(([category]) => category);
  if (asset.kind === "model" && !categories.includes("models")) categories.push("models");
  return categories.length ? categories.sort() : ["uncategorized"];
}
function previewUrl(canonicalPath, root) {
  if (!canonicalPath.startsWith("full-resolution/")) return publicMaterialUrl(canonicalPath);
  return publicMaterialUrl(canonicalPath.replace(/^full-resolution\//, `${root}/`));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/OrganizedAssetCatalog.js
var catalogPromise = null;
function loadOrganizedAssetCatalog(fetchFunction = fetch) {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      fetchJson(fetchFunction, PUBLIC_ASSET_INVENTORY_URL),
      fetchJson(fetchFunction, PUBLIC_ASSET_ALIASES_URL)
    ]).then(([inventory, aliases]) => buildCatalog(inventory, aliases)).catch((error) => {
      catalogPromise = null;
      throw error;
    });
  }
  return catalogPromise;
}
function buildCatalog(inventory, aliasCatalog) {
  const validated = validateOrganizedAssetCatalog(inventory);
  if (aliasCatalog?.schema !== "awtsmoos-asset-organization/v1") {
    throw new Error("Unsupported organized asset alias catalog.");
  }
  const aliases = new Map(
    (aliasCatalog.aliases || []).map((alias) => [alias.source, Object.freeze({ ...alias })])
  );
  return Object.freeze({
    aliases,
    assets: validated.assets,
    categories: organizedAssetCategories(validated.assets),
    origin: validated.origin,
    schema: validated.schema
  });
}
async function fetchJson(fetchFunction, url) {
  const response = await fetchFunction(url);
  if (!response?.ok) {
    throw new Error(`Organized asset catalog request failed: ${response?.status || "unknown"}`);
  }
  return response.json();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzTextureWarmup.js
var BACKGROUND_TEXTURE_TIMEOUT_MS = 3e4;
async function preloadCanonicalPhysicalMaterials(options, boot) {
  return preloadPublicMaterialImages({
    concurrency: 2,
    onSettled: (record) => recordSettled(boot, record),
    timeoutMs: textureTimeout(options)
  }).catch((error) => degraded(boot, "texture-preload", error));
}
async function warmCanonicalTextureUrls(options, boot) {
  const urls = [.../* @__PURE__ */ new Set([
    ...GRASS_URLS,
    ...houseImageEntries().map((entry) => entry.url)
  ])];
  let cursor = 0;
  const worker = async () => {
    while (cursor < urls.length) {
      const index = cursor;
      cursor += 1;
      const record = await loadPublicMaterialUrl(
        urls[index],
        textureTimeout(options)
      );
      if (!record.ok) {
        boot?.degrade("canonical-texture", directTextureError(urls[index], record));
      }
    }
  };
  await Promise.all([worker(), worker()]);
}
function recordSettled(boot, record) {
  if (record.loaded) return;
  const attempt = record.attempts?.at(-1) || {};
  const detail = `${attempt.stage || "load"}:${record.error || attempt.error || "unavailable"}`;
  boot?.degrade(record.role || "runtime-material", new Error(`${detail}:${record.primaryUrl}`));
}
function directTextureError(url, record) {
  return new Error(`${record.stage || "load"}:${record.error || "unavailable"}:${url}`);
}
function degraded(boot, system, error) {
  boot?.degrade(system, error);
  return { failed: 1, loaded: 0, ok: false, records: [] };
}
function textureTimeout(options) {
  return options.textureTimeoutMs || BACKGROUND_TEXTURE_TIMEOUT_MS;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/TextureStreamingCatalogPolicy.js
function textureStreamingCatalogPolicy(options = {}) {
  const enabled = options.organizedAssetCatalog === true;
  return Object.freeze({
    enabled,
    reason: enabled ? "explicit-catalog-discovery" : "runtime-material-registry"
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzTextureStreaming.js
function scheduleEretzTextureStreaming(assets, options = {}, boot = null) {
  const state = {
    catalog: null,
    catalogStatus: "pending",
    completed: 0,
    error: null,
    startedAt: null,
    status: "scheduled",
    total: 3
  };
  const delayMs = options.textureStreamingDelayMs ?? 0;
  state.promise = new Promise((resolve) => {
    setTimeout(async () => {
      state.startedAt = now();
      state.status = "catalog-policy";
      boot?.progress("texture-stream", 0, state.total, "Resolving deterministic material registry");
      Object.assign(state, await resolveStreamingCatalog(options, boot));
      state.completed = 1;
      state.status = "critical-nearby";
      boot?.progress("texture-stream", 1, state.total, "Decoding nearby canonical surfaces");
      assets.publicMaterialPreload = await preloadCanonicalPhysicalMaterials(options, boot);
      state.completed = 2;
      state.status = "semantic-warmup";
      boot?.progress("texture-stream", 2, state.total, "Streaming grass, houses, roads, and water");
      await warmCanonicalTextureUrls(options, boot);
      state.completed = 3;
      state.status = "scene-cadence";
      assets.publicMaterialCache = publicMaterialCacheStats();
      state.cache = assets.publicMaterialCache;
      boot?.progress(
        "texture-stream",
        3,
        state.total,
        "Visible materials hydrate by ranked scene relevance.",
        "ready"
      );
      resolve(state);
    }, delayMs);
  });
  return state;
}
async function resolveStreamingCatalog(options = {}, boot = null) {
  const policy = textureStreamingCatalogPolicy(options);
  if (!policy.enabled) {
    return {
      catalog: null,
      catalogPolicy: policy.reason,
      catalogStatus: "disabled-by-default",
      error: null
    };
  }
  try {
    return {
      catalog: await loadOrganizedAssetCatalog(options.fetchFunction),
      catalogPolicy: policy.reason,
      catalogStatus: "ready",
      error: null
    };
  } catch (error) {
    boot?.degrade("organized-asset-catalog", error);
    return {
      catalog: null,
      catalogPolicy: policy.reason,
      catalogStatus: "failed",
      error: error.message
    };
  }
}
function now() {
  return globalThis.performance?.now?.() ?? Date.now();
}
export {
  resolveStreamingCatalog,
  scheduleEretzTextureStreaming
};
