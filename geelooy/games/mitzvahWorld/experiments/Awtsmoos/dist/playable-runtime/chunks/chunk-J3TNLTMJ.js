// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialOrigin.js
var LOCAL_RUNTIME_ROOT = "./assets/materials/local/world/";
var PUBLIC_MATERIAL_ORIGIN = LOCAL_RUNTIME_ROOT.replace(/\/$/, "");
var PUBLIC_MATERIAL_CATALOG_URL = publicMaterialUrl("catalog/materials.json");
var PUBLIC_ASSET_INVENTORY_URL = publicMaterialUrl("catalog/asset-inventory.json");
var PUBLIC_ASSET_ALIASES_URL = publicMaterialUrl("catalog/asset-aliases.json");
var PUBLIC_ASSET_SUMMARY_URL = publicMaterialUrl("catalog/materials-summary.json");
function publicMaterialUrl(relativePath) {
  const cleanPath = String(relativePath || "").replace(/^\/+/, "").replace(/\\/g, "/");
  return `${LOCAL_RUNTIME_ROOT}${encodePath(cleanPath)}`;
}
function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialResolver.js
var FULL_SOURCE_ALIASES = Object.freeze({
  "grass 6": "awtsmoos-nature/chai-forest/textures/ground/grass.jpg",
  "mud": "awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg",
  "oak wood 2": "full-resolution/oak wood 3.png",
  "stone floor": "full-resolution/stone floor 2.png"
});
function fullMaterialUrl(name, extension = "png") {
  return publicMaterialUrl(fullMaterialPath(name, extension));
}
function exactMaterialUrl(relativePath) {
  return publicMaterialUrl(relativePath);
}
function fullMaterialPath(name, extension = "png") {
  return FULL_SOURCE_ALIASES[name] || `full-resolution/${name}.${extension}`;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/LocalMaterialPathRules.js
var PARSE_BASE = new URL("https://same-origin.invalid/");
var ABSOLUTE_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
var LOCAL_PREFIXES = Object.freeze([
  "/assets/materials/local/",
  "/assets/materials/generated/",
  "/geelooy/games/mitzvahworld/assets/materials/local/",
  "/geelooy/games/mitzvahworld/assets/materials/generated/"
]);
var LOCAL_FILES = Object.freeze([
  "/geelooy/games/mitzvahworld/assets/models/reference-world/flower_4_clump.glb"
]);
var FORBIDDEN_MATERIAL_SEGMENTS = Object.freeze([
  "half-resolution",
  "quarter-resolution",
  "chai-forest-half",
  "staging"
]);
function assertLocalMaterialPath(url, role) {
  const rawUrl = normalizeUrl(url, role);
  assertRelativeUrl(rawUrl, role);
  const rawPath = decodePath(rawUrl.split(/[?#]/, 1)[0], url, role);
  assertNoTraversal(rawPath, url, role);
  const pathname = decodePath(parseUrl(rawUrl, role).pathname, url, role).toLowerCase();
  assertNoForbiddenSegment(pathname, url, role);
  assertApprovedPath(pathname, url, role);
}
function normalizeUrl(url, role) {
  if (typeof url !== "string" || url.trim() === "") {
    throw new Error(`Production material ${role} requires a non-empty URL.`);
  }
  return url.trim();
}
function assertRelativeUrl(url, role) {
  if (url.startsWith("//") || ABSOLUTE_SCHEME.test(url)) {
    throw new Error(`Production material ${role} must remain same-origin and local: ${url}`);
  }
}
function parseUrl(url, role) {
  try {
    return new URL(url, PARSE_BASE);
  } catch (error) {
    throw new Error(`Invalid production material URL for ${role}: ${url}`, { cause: error });
  }
}
function decodePath(path, url, role) {
  try {
    return decodeURIComponent(path).replace(/\\/g, "/");
  } catch {
    throw new Error(`Invalid encoded production material URL for ${role}: ${url}`);
  }
}
function assertNoTraversal(path, url, role) {
  if (path.split("/").filter(Boolean).includes("..")) {
    throw new Error(`Production material ${role} cannot traverse directories: ${url}`);
  }
}
function assertNoForbiddenSegment(pathname, url, role) {
  const segments = pathname.split("/").filter(Boolean);
  const forbidden = FORBIDDEN_MATERIAL_SEGMENTS.find((segment) => segments.includes(segment));
  if (forbidden) {
    throw new Error(`Production material ${role} uses forbidden folder ${forbidden}: ${url}`);
  }
}
function assertApprovedPath(pathname, url, role) {
  const approvedPrefix = LOCAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!approvedPrefix && !LOCAL_FILES.includes(pathname)) {
    throw new Error(`Production material ${role} requires an approved local asset: ${url}`);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ProductionMaterialUrlPolicy.js
function assertProductionMaterialUrl(url, role = "runtime material") {
  assertLocalMaterialPath(url, role);
  return url;
}
function isSameOriginMaterialUrl(url) {
  try {
    assertLocalMaterialPath(url, "runtime material");
    return true;
  } catch {
    return false;
  }
}
function productionMaterialFallbacks(urls = [], role = "runtime material") {
  return Object.freeze(urls.map((url, index) => {
    return assertProductionMaterialUrl(url, `${role} fallback ${index + 1}`);
  }));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/RuntimeMaterialManifest.js
function materialRole(role, label, primaryUrl, options = {}) {
  return Object.freeze({
    critical: options.critical !== false,
    fallbackUrls: productionMaterialFallbacks(options.fallbackUrls, role),
    label,
    primaryUrl: assertProductionMaterialUrl(primaryUrl, role),
    repeat: Object.freeze(options.repeat || [1, 1]),
    role
  });
}
function fullRole(role, label, name, options = {}) {
  return materialRole(role, label, fullMaterialUrl(name), options);
}
function sourceRole(role, label, path, options = {}) {
  return materialRole(role, label, exactMaterialUrl(path), options);
}
var CHAI_FOREST = "awtsmoos-nature/chai-forest";
var RUNTIME_MATERIALS = Object.freeze([
  sourceRole("terrain.grass", "canonical Chai Forest grass", `${CHAI_FOREST}/textures/ground/grass.jpg`, {
    fallbackUrls: [fullMaterialUrl("grass 1")],
    repeat: [18, 18]
  }),
  sourceRole("terrain.dirtMix", "canonical Chai Forest dirt", `${CHAI_FOREST}/textures/ground/dirt_color.jpg`, {
    fallbackUrls: [fullMaterialUrl("dirt grass 3")],
    repeat: [15, 15]
  }),
  fullRole("road.yellowBrick", "full yellow brick road", "yellow brick 1"),
  fullRole("creature.horseFur", "full horse fur", "horse fur 1", { repeat: [3, 2] }),
  fullRole("vegetation.wildGrass", "wild grass", "grass 7", { critical: false, repeat: [10, 10] }),
  fullRole("terrain.marshGrass", "marsh grass", "marsh grass", { critical: false, repeat: [12, 12] }),
  fullRole("terrain.mud", "mud", "mud", { critical: false, repeat: [12, 12] }),
  fullRole("terrain.sandShore", "sand shore", "sand 1", { critical: false, repeat: [14, 14] }),
  fullRole("water.lake", "lake water color", "seamless water brighter", { repeat: [8, 8] }),
  fullRole("water.stream", "stream water color", "shallow river water", { repeat: [12, 4] }),
  fullRole("water.still", "still water color", "seamless water", { critical: false, repeat: [8, 8] }),
  sourceRole("forest.bark", "canonical Chai Forest bark", `${CHAI_FOREST}/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg`, {
    fallbackUrls: [fullMaterialUrl("tree bark 1")],
    repeat: [3, 8]
  }),
  fullRole("village.woodPlanks", "wood planks", "wooden oak planks 1", { repeat: [4, 4] }),
  sourceRole("forest.chaiOak", "canonical Chai oak leaf", `${CHAI_FOREST}/textures/leaves/oak.png`, { critical: false }),
  sourceRole("forest.chaiAsh", "canonical Chai ash leaf", `${CHAI_FOREST}/textures/leaves/ash.png`, { critical: false }),
  sourceRole("forest.chaiAspen", "canonical Chai aspen leaf", `${CHAI_FOREST}/textures/leaves/aspen.png`, { critical: false }),
  sourceRole("forest.chaiPine", "canonical Chai pine leaf", `${CHAI_FOREST}/textures/leaves/pine.png`, { critical: false }),
  sourceRole("botany.petal", "sakura petal atlas", "awtsmoos-nature/ilanos/trees/sakura petal.png", { critical: false }),
  fullRole("stone.general", "stone", "stone 1", { critical: false, repeat: [5, 5] }),
  fullRole("stone.fieldstone", "fieldstone", "weathered fieldstone Rock 1", { repeat: [4, 4] }),
  fullRole("roof.tile", "roof tile", "tiled roof 2", { repeat: [5, 3] }),
  fullRole("metal.gold", "gold", "gold 2", { critical: false }),
  fullRole("metal.iron", "iron", "rusty iron", { critical: false }),
  fullRole("sign.parchment", "parchment sign", "parchment", { critical: false }),
  fullRole("mezuzah.case", "mezuzah case", "gold 2", { critical: false })
]);
var CRITICAL_RUNTIME_MATERIALS = Object.freeze(
  RUNTIME_MATERIALS.filter((material) => {
    return material.critical;
  })
);
function runtimeMaterialByRole(role) {
  return RUNTIME_MATERIALS.find((material) => {
    return material.role === role;
  }) || null;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageDecode.js
function decodePublicImageBlob(url, blob, timeoutMs = 3e4, dependencies = {}) {
  const UrlApi = dependencies.UrlApi || globalThis.URL;
  if (!UrlApi?.createObjectURL || !UrlApi?.revokeObjectURL) {
    return Promise.resolve(failed("object-url-unavailable", "blob-decode"));
  }
  const objectUrl = UrlApi.createObjectURL(blob);
  return decodeImageSource(objectUrl, url, timeoutMs, {
    ...dependencies,
    method: "blob-object-url"
  }).finally(() => UrlApi.revokeObjectURL(objectUrl));
}
function decodePublicImageUrl(url, timeoutMs = 3e4, dependencies = {}) {
  return decodeImageSource(url, url, timeoutMs, {
    ...dependencies,
    method: "direct-image-url"
  });
}
function decodeImageSource(sourceUrl, publicUrl, timeoutMs, dependencies) {
  const ImageClass = dependencies.ImageClass || globalThis.Image;
  if (typeof ImageClass !== "function") {
    return Promise.resolve(failed("image-class-unavailable", "decode"));
  }
  return new Promise((resolve) => {
    const image = new ImageClass();
    let settled = false;
    const finish = (record) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve(record);
    };
    const timer = setTimeout(() => {
      try {
        image.src = "";
      } catch {
      }
      finish(failed("timeout", "decode", dependencies.method));
    }, timeoutMs);
    if (sourceUrl === publicUrl) image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      const width = image.naturalWidth || image.width || 0;
      const height = image.naturalHeight || image.height || 0;
      if (!width || !height) {
        finish(failed("zero-dimension-image", "decode", dependencies.method));
        return;
      }
      if (image.dataset) {
        image.dataset.publicUrl = publicUrl;
        image.dataset.url = publicUrl;
        image.dataset.loadedFromPublicUrl = sourceUrl === publicUrl ? "true" : "blob";
      }
      finish({
        error: null,
        height,
        image,
        method: dependencies.method,
        ok: true,
        stage: "decoded",
        width
      });
    };
    image.onerror = () => finish(failed(
      "image-decode-error",
      "decode",
      dependencies.method
    ));
    image.src = sourceUrl;
  });
}
function failed(error, stage, method = "none") {
  return {
    error,
    height: 0,
    image: null,
    method,
    ok: false,
    stage,
    width: 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageFetch.js
async function fetchPublicImageBlob(url, timeoutMs = 3e4, dependencies = {}) {
  const fetchFunction = Object.hasOwn(dependencies, "fetchFunction") ? dependencies.fetchFunction : globalThis.fetch;
  if (typeof fetchFunction !== "function") {
    return failed2("fetch-unavailable", "fetch", { status: 0 });
  }
  const Controller = Object.hasOwn(dependencies, "AbortControllerClass") ? dependencies.AbortControllerClass : globalThis.AbortController;
  const controller = Controller ? new Controller() : null;
  const timer = setTimeout(() => controller?.abort(), timeoutMs);
  try {
    const response = await fetchFunction(url, {
      cache: "force-cache",
      credentials: "omit",
      mode: "cors",
      signal: controller?.signal
    });
    const contentType = response.headers?.get?.("content-type") || "";
    if (!response.ok) {
      return failed2(`http-${response.status}`, "http", {
        contentType,
        status: response.status
      });
    }
    if (!contentType.toLowerCase().startsWith("image/")) {
      return failed2("non-image-content-type", "content-type", {
        contentType,
        status: response.status
      });
    }
    const blob = await response.blob();
    if (!blob?.size) {
      return failed2("empty-image-blob", "blob", {
        contentType,
        status: response.status
      });
    }
    return {
      blob,
      contentType,
      error: null,
      method: "fetch-blob",
      ok: true,
      stage: "fetched",
      status: response.status
    };
  } catch (error) {
    const aborted = error?.name === "AbortError" || controller?.signal?.aborted;
    return failed2(aborted ? "timeout" : error?.message || "network-error", "fetch", {
      status: 0
    });
  } finally {
    clearTimeout(timer);
  }
}
function failed2(error, stage, evidence = {}) {
  return {
    blob: null,
    contentType: evidence.contentType || "",
    error,
    method: "fetch-blob",
    ok: false,
    stage,
    status: evidence.status || 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialImageLoader.js
async function loadPublicMaterialImage(url, timeoutMs = 3e4, dependencies = {}) {
  const startedAt = now(dependencies);
  const attempts = [];
  const direct = await decodePublicImageUrl(url, timeoutMs, dependencies);
  attempts.push(attemptEvidence(direct));
  if (direct.ok) {
    return successRecord(url, direct, null, attempts, startedAt, dependencies);
  }
  const fetched = await fetchPublicImageBlob(url, timeoutMs, dependencies);
  attempts.push(attemptEvidence(fetched));
  if (fetched.ok) {
    const decoded = await decodePublicImageBlob(
      url,
      fetched.blob,
      timeoutMs,
      dependencies
    );
    attempts.push(attemptEvidence(decoded));
    if (decoded.ok) {
      return successRecord(url, decoded, fetched, attempts, startedAt, dependencies);
    }
  }
  return failureRecord(url, direct, fetched, attempts, startedAt, dependencies);
}
function serializableImageRecord(record) {
  return {
    attempts: (record.attempts || []).map((attempt) => ({ ...attempt })),
    contentType: record.contentType || "",
    durationMs: record.durationMs,
    error: record.error || null,
    fromCache: Boolean(record.fromCache),
    height: record.height,
    method: record.method || null,
    ok: record.ok,
    stage: record.stage || null,
    status: record.status || 0,
    url: record.url,
    width: record.width
  };
}
function successRecord(url, decoded, fetched, attempts, startedAt, dependencies) {
  return {
    attempts,
    contentType: fetched?.contentType || "",
    durationMs: Math.round(now(dependencies) - startedAt),
    error: null,
    height: decoded.height,
    image: decoded.image,
    method: decoded.method,
    ok: true,
    stage: "decoded",
    status: fetched?.status || 200,
    url,
    width: decoded.width
  };
}
function failureRecord(url, direct, fetched, attempts, startedAt, dependencies) {
  const final = attempts.at(-1) || {};
  return {
    attempts,
    contentType: fetched?.contentType || "",
    durationMs: Math.round(now(dependencies) - startedAt),
    error: final.error || direct.error || fetched?.error || "image-load-failed",
    height: 0,
    image: null,
    method: final.method || "none",
    ok: false,
    stage: final.stage || "unknown",
    status: fetched?.status || 0,
    url,
    width: 0
  };
}
function attemptEvidence(record = {}) {
  return {
    contentType: record.contentType || "",
    error: record.error || null,
    method: record.method || "none",
    ok: Boolean(record.ok),
    stage: record.stage || "unknown",
    status: record.status || 0
  };
}
function now(dependencies) {
  return dependencies.now?.() ?? globalThis.performance?.now?.() ?? Date.now();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/SceneMaterialPriority.js
var LOCAL_MATERIAL_URL = /^(?:\.\/|\/)(?:assets\/materials\/(?:local|generated)\/|geelooy\/games\/mitzvahworld\/assets\/materials\/(?:local|generated)\/)/i;
var NETWORK_MATERIAL_URL = /^https?:\/\//i;
function rankedSceneUrls(root) {
  const records = /* @__PURE__ */ new Map();
  root?.traverse?.((object) => collectObject(records, object));
  return [...records.values()].sort((left, right) => right.score - left.score || left.url.localeCompare(right.url));
}
function isSceneMaterialUrl(url) {
  const value = String(url || "").trim();
  return NETWORK_MATERIAL_URL.test(value) || LOCAL_MATERIAL_URL.test(value);
}
function collectObject(records, object) {
  const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
  for (const material of materials) collectMaterial(records, object, material);
}
function collectMaterial(records, object, material) {
  const role = `${object.name || ""} ${object.userData?.family || ""} ${material.name || ""}`.toLowerCase();
  const base = roleScore(role);
  add(records, material.textureUrl, role, base + 40);
  add(records, material.mixTextureUrl, role, base + 36);
  for (const [index, layer] of (material.textureLayers || []).entries()) {
    const layerRole = `${role} ${layer.role || ""}`;
    add(records, layer.url, layerRole, base + 20 - index * 6);
  }
}
function add(records, url, role, score) {
  if (!isSceneMaterialUrl(url)) return;
  const existing = records.get(url);
  if (existing) {
    existing.references += 1;
    existing.score = Math.max(existing.score, score) + 2;
    return;
  }
  records.set(url, { references: 1, role, score, url });
}
function roleScore(role) {
  if (/cottage|house|roof|wall|stone|timber|wood/.test(role)) return 120;
  if (/terrain|grass|ground/.test(role)) return 110;
  if (/road|cobble|path|bridge/.test(role)) return 105;
  if (/water|lake|stream|river/.test(role)) return 100;
  if (/forest|tree|bark|leaf/.test(role)) return 55;
  return 20;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialCache.js
var SCENE_MATERIAL_HYDRATION_URL_LIMIT = 2;
var imageCache = /* @__PURE__ */ new Map();
var urlRecords = /* @__PURE__ */ new Map();
var loadingByUrl = /* @__PURE__ */ new Map();
var roleRecords = /* @__PURE__ */ new Map();
function cachedTextureImage(url) {
  const image = imageCache.get(url);
  return usableImage(image) ? image : null;
}
async function loadPublicMaterialUrl(url, timeoutMs = 8e3) {
  const cached = cachedTextureImage(url);
  if (cached) {
    return {
      ...urlRecords.get(url) || imageEvidence(url, cached),
      ok: true,
      image: cached,
      fromCache: true
    };
  }
  if (loadingByUrl.has(url)) return loadingByUrl.get(url);
  const promise = loadPublicMaterialImage(url, timeoutMs).then((record) => {
    urlRecords.set(url, serializableImageRecord(record));
    if (record.ok) imageCache.set(url, record.image);
    return record;
  }).finally(() => loadingByUrl.delete(url));
  loadingByUrl.set(url, promise);
  return promise;
}
async function loadRuntimeMaterial(material, options = {}) {
  const candidates = [material.primaryUrl, ...material.fallbackUrls];
  const attempts = [];
  for (const candidate of candidates) {
    const result = await loadPublicMaterialUrl(candidate, options.timeoutMs);
    attempts.push(serializableImageRecord(result));
    if (!result.ok) continue;
    for (const alias of candidates) imageCache.set(alias, result.image);
    const record = roleEvidence(material, result, candidate, attempts);
    roleRecords.set(material.role, record);
    return record;
  }
  const failed3 = roleEvidence(material, null, null, attempts);
  roleRecords.set(material.role, failed3);
  return failed3;
}
async function loadRuntimeMaterialRoles(materials = RUNTIME_MATERIALS, options = {}) {
  const records = new Array(materials.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < materials.length) {
      const index = cursor++;
      const record = await loadRuntimeMaterial(materials[index], options);
      records[index] = record;
      options.onSettled?.(record, index);
    }
  };
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 3, materials.length || 1));
  await Promise.all(Array.from({ length: concurrency }, worker));
  return summarize(records);
}
async function preloadPublicMaterialImages(options = {}) {
  const source = options.all ? RUNTIME_MATERIALS : CRITICAL_RUNTIME_MATERIALS;
  const materials = source.slice(0, options.limit ?? source.length);
  return loadRuntimeMaterialRoles(materials, options);
}
function hydrateSceneMaterialImages(root, options = {}) {
  const stats = emptySceneHydrationStats(options);
  const referenced = /* @__PURE__ */ new Set();
  const ready = /* @__PURE__ */ new Set();
  const pending = /* @__PURE__ */ new Set();
  root?.traverse?.((object) => {
    const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
    for (const material of materials) {
      stats.materials += 1;
      hydrateMaterialSlots(object, material, stats, referenced, ready, pending);
    }
  });
  stats.referencedUrls = referenced.size;
  stats.readyUrls = ready.size;
  for (const url of pending) {
    if (stats.requested >= stats.requestLimit) break;
    if (cachedTextureImage(url)) continue;
    if (loadingByUrl.has(url)) {
      stats.loadingUrls += 1;
      continue;
    }
    const previous = urlRecords.get(url);
    if (previous && !previous.ok && options.retryFailed !== true) {
      stats.failedUrls += 1;
      continue;
    }
    stats.requested += 1;
    stats.requestedUrls.push(url);
    loadPublicMaterialUrl(url, options.timeoutMs ?? 8e3).catch(() => null);
  }
  return stats;
}
function publicMaterialCacheStats() {
  return {
    cachedAliases: imageCache.size,
    uniqueImages: new Set(imageCache.values()).size,
    loading: loadingByUrl.size,
    failedUrls: [...urlRecords.values()].filter((record) => !record.ok),
    roles: [...roleRecords.values()],
    sceneHydrationUrlLimit: SCENE_MATERIAL_HYDRATION_URL_LIMIT
  };
}
function hydrateMaterialSlots(object, material, stats, referenced, ready, pending) {
  hydrateSlot({
    boundField: "mapImagesBound",
    holder: material,
    imageKey: "mapImage",
    kind: "map",
    material,
    object,
    url: material.textureUrl
  }, stats, referenced, ready, pending);
  hydrateSlot({
    boundField: "mixImagesBound",
    holder: material,
    imageKey: "mixImage",
    kind: "mix",
    material,
    object,
    url: material.mixTextureUrl
  }, stats, referenced, ready, pending);
  for (const layer of material.textureLayers || []) {
    hydrateSlot({
      boundField: "layerImagesBound",
      holder: layer,
      imageKey: "image",
      kind: "layer",
      material,
      object,
      url: layer?.url
    }, stats, referenced, ready, pending);
  }
}
function hydrateSlot(slot, stats, referenced, ready, pending) {
  if (!isSceneMaterialUrl(slot.url)) return;
  referenced.add(slot.url);
  let current = slot.holder?.[slot.imageKey];
  const replaceable = slot.kind === "map" && replaceableMapImage(slot.material, current);
  const cached = cachedTextureImage(slot.url);
  if (cached && (!usableImage(current) || replaceable)) {
    const prepared = slot.kind === "map" ? prepareMapImage(slot.material, cached) : cached;
    if (prepared) {
      slot.holder[slot.imageKey] = prepared;
      current = prepared;
      stats[slot.boundField] += 1;
      if (slot.kind === "map") markRealMapImage(slot.object, slot.material);
    } else if (slot.kind === "map") {
      stats.mapTransformsPending += 1;
    }
  }
  if (usableImage(current) && !replaceableMapImage(slot.material, current)) {
    ready.add(slot.url);
    if (slot.object.userData && slot.kind === "map") {
      slot.object.userData.AwtsmoosMaterialEnforcement = "real-mapImage-bound-live";
    }
    return;
  }
  stats.pending += 1;
  pending.add(slot.url);
}
function prepareMapImage(material, image) {
  const transform = material?.texturePolicy?.hydrateMapImage;
  if (typeof transform !== "function") return image;
  try {
    const prepared = transform(image);
    return usableImage(prepared) ? prepared : null;
  } catch {
    return null;
  }
}
function replaceableMapImage(material, image) {
  return material?.mapImageFallback === true || material?.texturePolicy?.proceduralFallbackActive === true || image?.dataset?.replaceableByPublicTexture === "true";
}
function markRealMapImage(object, material) {
  material.mapImageFallback = false;
  if (material.texturePolicy && !Object.isFrozen(material.texturePolicy)) {
    material.texturePolicy.realMapImage = true;
    material.texturePolicy.proceduralFallbackActive = false;
  }
  const materialEvidence = material.userData?.AwtsmoosForestMaterial;
  if (materialEvidence && !Object.isFrozen(materialEvidence)) {
    materialEvidence.realMapImage = true;
    materialEvidence.proceduralFallback = false;
  }
  const objectEvidence = object.userData?.AwtsmoosForestLayer;
  if (objectEvidence && !Object.isFrozen(objectEvidence)) {
    objectEvidence.realMapImage = true;
    objectEvidence.proceduralFallback = false;
  }
}
function emptySceneHydrationStats(options = {}) {
  const requestedLimit = Number(options.requestLimit);
  const requestLimit = Number.isFinite(requestedLimit) ? Math.max(0, Math.min(SCENE_MATERIAL_HYDRATION_URL_LIMIT, Math.floor(requestedLimit))) : SCENE_MATERIAL_HYDRATION_URL_LIMIT;
  return {
    materials: 0,
    mapImagesBound: 0,
    mixImagesBound: 0,
    layerImagesBound: 0,
    mapTransformsPending: 0,
    pending: 0,
    requested: 0,
    requestedUrls: [],
    requestLimit,
    referencedUrls: 0,
    readyUrls: 0,
    loadingUrls: 0,
    failedUrls: 0
  };
}
function usableImage(image) {
  return !!(image && (image.naturalWidth || image.videoWidth || image.width) && (image.naturalHeight || image.videoHeight || image.height) && image.complete !== false);
}
function roleEvidence(material, result, selectedUrl, attempts) {
  return {
    role: material.role,
    label: material.label,
    primaryUrl: material.primaryUrl,
    selectedUrl,
    usedFallback: !!selectedUrl && selectedUrl !== material.primaryUrl,
    loaded: !!result?.ok,
    cacheBound: !!selectedUrl && !!cachedTextureImage(selectedUrl),
    width: result?.width || 0,
    height: result?.height || 0,
    durationMs: attempts.reduce((total, attempt) => total + attempt.durationMs, 0),
    error: result?.ok ? null : attempts.at(-1)?.error || "no-candidate-loaded",
    attempts
  };
}
function summarize(records) {
  const loaded = records.filter((record) => record.loaded).length;
  return {
    requested: records.length,
    loaded,
    failed: records.length - loaded,
    pending: 0,
    ok: loaded === records.length,
    strategy: "role-manifest-bounded-concurrency-shared-image-cache",
    records
  };
}
function imageEvidence(url, image) {
  return {
    url,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    durationMs: 0,
    error: null
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalContract.js
var VILLAGE_ARRIVAL_PLAYER = Object.freeze({
  facing: Math.PI,
  x: 0,
  z: 104
});
var VILLAGE_ARRIVAL_CAMERA = Object.freeze({
  clearingRadius: 20,
  clearingX: 0,
  clearingZ: 122,
  distance: 18,
  fov: 62,
  maxDistance: 52,
  minDistance: 2.2,
  pitch: 0.24,
  yaw: 2.86
});
var VILLAGE_ARRIVAL_SIGN = Object.freeze({
  x: -7,
  yaw: 0.12,
  z: 96
});
var VILLAGE_ARRIVAL_ENTRANCE = Object.freeze({
  x: 0,
  z: 101
});
var VILLAGE_ARRIVAL_CLEARINGS = Object.freeze([
  Object.freeze({ id: "arrival-spawn", radius: 16, x: 0, z: 104 }),
  Object.freeze({
    id: "arrival-camera",
    radius: VILLAGE_ARRIVAL_CAMERA.clearingRadius,
    x: VILLAGE_ARRIVAL_CAMERA.clearingX,
    z: VILLAGE_ARRIVAL_CAMERA.clearingZ
  })
]);

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageSignCatalog.js
var VILLAGE_SIGN_GROUPS = Object.freeze([
  signGroup(
    "arrival",
    VILLAGE_ARRIVAL_SIGN.x,
    VILLAGE_ARRIVAL_SIGN.z,
    VILLAGE_ARRIVAL_SIGN.yaw,
    [
      destination("shul", "Shul", "\u05D1\u05D9\u05EA \u05DB\u05E0\u05E1\u05EA"),
      destination("market", "Market", "\u05E9\u05D5\u05E7"),
      destination("beis-chabad", "Beis Chabad", "\u05D1\u05D9\u05EA \u05D7\u05D1\u05F4\u05D3"),
      destination("lake", "Lake", "\u05D0\u05D2\u05DD")
    ]
  ),
  signGroup("bridge", 8, 15, -0.18, [
    destination("river", "River", "\u05E0\u05D4\u05E8"),
    destination("waterfall", "Waterfall", "\u05DE\u05E4\u05DC")
  ]),
  signGroup("upper-village", -16, -18, 0.58, [
    destination("homes", "Upper Homes", "\u05D1\u05EA\u05D9 \u05D4\u05D4\u05E8"),
    destination("forest", "Forest", "\u05D9\u05E2\u05E8")
  ]),
  signGroup("portal-route", 39, -20, -0.62, [
    destination("portal", "Portal", "\u05E9\u05E2\u05E8")
  ])
]);
var VILLAGE_DESTINATIONS = Object.freeze(
  VILLAGE_SIGN_GROUPS.flatMap((group) => group.destinations)
);
function signGroup(id, x, z, yaw, destinations) {
  return Object.freeze({
    destinations: Object.freeze(destinations),
    id,
    position: Object.freeze({ x, z }),
    yaw
  });
}
function destination(id, english, hebrew) {
  return Object.freeze({ english, hebrew, id });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageSignTexture.js
function createVillageSignTextureUrl(group) {
  const rows = group.destinations.map(createDestinationRow).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256">
	<defs>
		<linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#d9b878"/>
			<stop offset="0.5" stop-color="#b98243"/>
			<stop offset="1" stop-color="#81502a"/>
		</linearGradient>
	</defs>
	<rect width="512" height="256" rx="24" fill="url(#wood)"/>
	<rect x="10" y="10" width="492" height="236" rx="18" fill="none" stroke="#4a2c17" stroke-width="8"/>
	<path d="M24 48 C160 22 330 72 488 42 M24 214 C182 184 340 232 488 202" fill="none" stroke="#6b3f20" stroke-opacity="0.42" stroke-width="5"/>
	<text x="256" y="35" text-anchor="middle" font-family="Arial, Noto Sans Hebrew, sans-serif" font-size="17" font-weight="700" fill="#fff0c8">WAYFINDING \xB7 \u05E9\u05D9\u05DC\u05D5\u05D8</text>
	${rows}
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function villageSignTextureUrls() {
  return VILLAGE_SIGN_GROUPS.map(createVillageSignTextureUrl);
}
async function preloadVillageSignTextures() {
  const urls = villageSignTextureUrls();
  if (typeof Image === "undefined") {
    return skippedEvidence(urls.length);
  }
  const records = await Promise.all(
    urls.map((url) => loadPublicMaterialUrl(url, 2500))
  );
  const loaded = records.filter((record) => record.ok).length;
  return {
    failed: records.length - loaded,
    loaded,
    requested: records.length,
    records: records.map((record, index) => ({
      error: record.error || null,
      height: record.height || 0,
      index,
      ok: record.ok,
      width: record.width || 0
    })),
    skipped: false,
    strategy: "generated-svg-shared-material-cache"
  };
}
function createDestinationRow(destination2, index, destinations) {
  const spacing = destinations.length === 1 ? 0 : 58;
  const y = destinations.length === 1 ? 140 : 78 + index * spacing;
  const size = destination2.english.length > 13 ? 24 : 29;
  return `<text x="38" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="800" fill="#26160c">${escapeXml(destination2.english)}</text>
	<text x="474" y="${y}" text-anchor="end" direction="rtl" unicode-bidi="bidi-override" font-family="Arial, Noto Sans Hebrew, sans-serif" font-size="29" font-weight="800" fill="#26160c">${escapeXml(destination2.hebrew)}</text>`;
}
function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
function skippedEvidence(requested) {
  return {
    failed: 0,
    loaded: 0,
    reason: "browser-image-api-unavailable",
    requested,
    records: [],
    skipped: true,
    strategy: "generated-svg-shared-material-cache"
  };
}

export {
  PUBLIC_ASSET_INVENTORY_URL,
  PUBLIC_ASSET_ALIASES_URL,
  publicMaterialUrl,
  fullMaterialUrl,
  exactMaterialUrl,
  assertProductionMaterialUrl,
  isSameOriginMaterialUrl,
  runtimeMaterialByRole,
  rankedSceneUrls,
  cachedTextureImage,
  loadPublicMaterialUrl,
  preloadPublicMaterialImages,
  hydrateSceneMaterialImages,
  publicMaterialCacheStats,
  VILLAGE_ARRIVAL_PLAYER,
  VILLAGE_ARRIVAL_CAMERA,
  VILLAGE_ARRIVAL_ENTRANCE,
  VILLAGE_ARRIVAL_CLEARINGS,
  VILLAGE_SIGN_GROUPS,
  VILLAGE_DESTINATIONS,
  createVillageSignTextureUrl,
  villageSignTextureUrls,
  preloadVillageSignTextures
};
