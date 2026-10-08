//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Master orchestrator for the Airtight CSS Guarantee System.
 *
 * Runs the layers in order and returns a single result object:
 *   { ok, layerResults, blocked }
 *
 * Guarantees:
 * - Never throws on layer failure: every layer runs inside try/catch and a
 *   failed layer is recorded as {layer, ok:false, error}, then we continue.
 * - fail-open (default): findings are collected and reported; the tunnel
 *   keeps working. fail-closed: any blocking finding sets blocked=true.
 * - Layer 3 is a stub: screenshotting needs a live deploy; run it post-deploy.
 */

import { getMode, getEnabledLayers } from "./featureFlags.mjs";

/** Severity ranks that count as blocking in fail-closed mode. */
const BLOCKING_SEVERITIES = new Set(["medium", "high", "critical"]);

const LAYER_NAMES = {
  1: "Layer 1 — Selector registry, specificity, ownership, interactive states",
  2: "Layer 2 — Auto-scope, hash filenames, auto-animate",
  3: "Layer 3 — Device matrix, interactive audit, touch targets, PDF verify, snapshots",
  4: "Layer 4/14 — Style firewall telemetry",
};

function isBlockingFinding(finding) {
  if (!finding || typeof finding !== "object") return false;
  return BLOCKING_SEVERITIES.has(String(finding.severity || "").toLowerCase());
}

function summarizeFindings(findings) {
  const list = Array.isArray(findings) ? findings : [];
  return {
    count: list.length,
    blocking: list.filter(isBlockingFinding).length,
    byCategory: list.reduce((acc, f) => {
      const key = f?.category || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    findings: list,
  };
}

async function safeImport(relativePath) {
  return import(new URL(relativePath, import.meta.url).href);
}

function normalizeCssSources(cssSources) {
  return (Array.isArray(cssSources) ? cssSources : [])
    .filter((s) => s && typeof s === "object" && typeof s.content === "string")
    .map((s, i) => ({ path: s.path || `source-${i}.css`, content: s.content }));
}

async function runLayer1(sources, mode) {
  // Dynamic imports so a missing layer module fails inside the per-layer
  // catch instead of at pipeline load time.
  const { buildSelectorRegistry } = await safeImport("./layer1/selectorRegistry.mjs");
  const { auditSpecificity } = await safeImport("./layer1/specificity.mjs");
  const { auditOwnership } = await safeImport("./layer1/ownershipContracts.mjs");
  const { auditInteractiveStatesBlocking } = await safeImport("./layer1/interactiveStates.mjs");

  const registry = buildSelectorRegistry(sources);
  const registryFindings = (registry.conflicts || []).flatMap((c) => c.findings || []);
  const specificityFindings = auditSpecificity(sources);
  const ownershipFindings = auditOwnership(sources);
  const interactive = auditInteractiveStatesBlocking(sources, { mode });

  const allFindings = [
    ...registryFindings,
    ...specificityFindings,
    ...ownershipFindings,
    ...(interactive.findings || []),
  ];
  const summary = summarizeFindings(allFindings);
  const blocking = mode === "fail-closed" && (summary.blocking > 0 || interactive.blocking === true);
  return {
    blocking,
    registryConflicts: (registry.conflicts || []).length,
    specificityFindings: specificityFindings.length,
    ownershipFindings: ownershipFindings.length,
    interactiveFindings: (interactive.findings || []).length,
    interactiveBlocking: interactive.blocking === true,
    summary,
  };
}

async function runLayer2(sources) {
  const { autoScope, generateScopeId } = await safeImport("./layer2/autoScope.mjs");
  const { hashFilename } = await safeImport("./layer2/hashFilenames.mjs");
  const { injectAnimations } = await safeImport("./layer2/autoAnimate.mjs");

  const transformed = sources.map((source) => {
    const scopeId = generateScopeId(source.path);
    const scoped = autoScope(source.content, scopeId);
    const animated = injectAnimations(scoped.css);
    const newFilename = hashFilename(source.path, source.content);
    return {
      originalPath: source.path,
      path: newFilename,
      scopeId,
      content: animated.css,
      warnings: scoped.warnings || [],
      animationsInjected: animated.injected || 0,
      hoverWithoutTransform: animated.hoverWithoutTransform || [],
    };
  });
  return { blocking: false, transformedCount: transformed.length, transformed };
}

async function runLayer4() {
  const { getStats, shouldRollback } = await safeImport("./layer4/telemetry.mjs");
  const stats = getStats();
  return {
    blocking: false,
    rollbackAdvised: shouldRollback(),
    telemetry: stats,
  };
}

/**
 * Run the guarantee pipeline.
 * @param {object} options
 * @param {Array<{path:string,content:string}>} options.cssSources
 * @param {string} [options.mode] "fail-open" | "fail-closed" (env default)
 * @param {number[]} [options.layers] e.g. [1,2,3,4] (env default)
 * @param {Array<{path:string,content:string}>} [options.htmlFiles] reserved for layer 2 link rewriting
 * @returns {Promise<{ok:boolean, layerResults:Array, blocked:boolean}>}
 */
export async function runPipeline(options = {}) {
  const mode = options.mode === "fail-closed" || options.mode === "fail-open"
    ? options.mode
    : getMode();
  const layers = Array.isArray(options.layers) ? options.layers : getEnabledLayers();
  const sources = normalizeCssSources(options.cssSources);
  const layerResults = [];
  let blocked = false;

  async function runLayer(num, fn) {
    const name = LAYER_NAMES[num] || `Layer ${num}`;
    if (!layers.includes(num)) {
      layerResults.push({ layer: num, name, ok: true, skipped: true });
      return null;
    }
    try {
      const detail = await fn();
      if (mode === "fail-closed" && detail && detail.blocking === true) {
        blocked = true;
      }
      layerResults.push({ layer: num, name, ok: true, detail });
      return detail;
    } catch (error) {
      // Fail-open at the pipeline level: record and continue. The tunnel
      // must keep working even if a guarantee layer explodes.
      layerResults.push({
        layer: num,
        name,
        ok: false,
        error: error && error.message ? error.message : String(error),
      });
      return null;
    }
  }

  await runLayer(1, () => runLayer1(sources, mode));
  await runLayer(2, () => runLayer2(sources));
  await runLayer(3, async () => ({
    stub: true,
    blocking: false,
    message: "Layer 3 requires live deploy; run post-deploy",
  }));
  await runLayer(4, () => runLayer4());

  const anyLayerFailed = layerResults.some((r) => r.ok === false && r.skipped !== true);
  const ok = !anyLayerFailed && !blocked;
  return { ok, layerResults, blocked, mode, layers };
}

/**
 * Human-readable multi-line report of a pipeline result.
 * @param {{ok:boolean, blocked:boolean, mode?:string, layers?:number[], layerResults:Array}} result
 * @returns {string}
 */
export function formatPipelineReport(result = {}) {
  const lines = [];
  lines.push(`B"H CSS Guarantee pipeline report`);
  lines.push(`Mode: ${result.mode || getMode()} | Layers: ${(result.layers || getEnabledLayers()).join(",")}`);
  lines.push(`Result: ${result.blocked ? "BLOCKED" : result.ok ? "OK" : "ERRORS"}`);
  for (const r of result.layerResults || []) {
    const tag = r.skipped ? "SKIPPED" : r.ok ? "PASS" : "FAIL";
    let extra = "";
    if (r.detail && r.detail.stub) extra = ` — ${r.detail.message}`;
    else if (r.detail && r.detail.summary) {
      const s = r.detail.summary;
      extra = ` — ${s.count} findings (${s.blocking} blocking)`;
    } else if (r.detail && typeof r.detail.transformedCount === "number") {
      extra = ` — ${r.detail.transformedCount} sources transformed`;
    } else if (r.detail && r.detail.telemetry) {
      extra = ` — ${r.detail.telemetry.total} corrections, rollbackAdvised=${r.detail.rollbackAdvised}`;
    }
    lines.push(`  [${tag}] ${r.name}${extra}`);
    if (!r.ok && r.error) lines.push(`         error: ${r.error}`);
  }
  return lines.join("\n");
}
