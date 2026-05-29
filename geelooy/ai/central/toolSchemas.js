// B"H
import { makeNextStepToolSchema } from "./nextStepTool.js";

const TOOL_DETAIL_NAME = "awtsmoos_tool_details";
const TOOL_CALL_NAME = "awtsmoos_tool_call";

/**
 * B"H
 * Chapter 262: A True Schema Outranked A Thousand Generic Keys.
 *
 * Generated fallbacks are wide, but not wise. A dynamic schema from `/tools`,
 * `/schemas`, `/manifest`, or a rich `/actions` object now always outranks a
 * name-only fallback, even when the fallback has more generic properties.
 */
export function makeAwtsmoosToolSchema(action) {
  const meta = normalizeActionMeta(action);
  return { type: "function", function: { name: meta.name, description: meta.description || toolDescription(meta.name), parameters: normalizeParameters(meta.parameters || meta.schema || meta.inputSchema || genericActionParameters(meta.name)) } };
}

export function makeToolSchemas(actions = []) { return uniqueByName(actions.map(normalizeActionMeta)).map(makeAwtsmoosToolSchema); }
export function makeBridgeToolSchemas(essential = [], allActions = []) { const catalog = normalizeActionCatalog(allActions.length ? allActions : essential); const visible = essentialActionMetas(essential, catalog); return [...makeToolSchemas(visible), makeNextStepToolSchema(), makeToolDetailsSchema(catalog), makeToolCallSchema(catalog)]; }
export function makeToolDetailsSchema(actions = []) { const catalog = normalizeActionCatalog(actions); return { type: "function", function: { name: TOOL_DETAIL_NAME, description: `Search/get full dynamic JSON schema details for Awtsmoos tunnel tools. Catalog sample: ${compactNames(catalog.map(item => item.name))}.`, parameters: { type: "object", additionalProperties: false, properties: { names: { type: "array", items: { type: "string" }, description: "Exact tool/action names to describe." }, query: { type: "string", description: "Search text to find matching tool names/descriptions." } } } } }; }
export function makeToolCallSchema(actions = []) { const catalog = normalizeActionCatalog(actions); return { type: "function", function: { name: TOOL_CALL_NAME, description: `Run any Awtsmoos tunnel tool by exact name. Use awtsmoos_tool_details for full per-tool schemas. Use repo-relative paths such as geelooy/games/app/index.html; avoid invented /data paths. Catalog sample: ${compactNames(catalog.map(item => item.name))}.`, parameters: { type: "object", additionalProperties: false, required: ["name", "arguments"], properties: { name: { type: "string", description: "Exact Awtsmoos action/tool name." }, arguments: { type: "object", additionalProperties: true, description: "Arguments matching that tool's dynamic JSON schema." } } } } }; }
export function isCatalogToolName(name = "") { return name === TOOL_DETAIL_NAME || name === TOOL_CALL_NAME; }
export function toolDetailName() { return TOOL_DETAIL_NAME; }
export function toolCallName() { return TOOL_CALL_NAME; }
export function describeTool(action = "") { const meta = normalizeActionMeta(action); const schema = makeAwtsmoosToolSchema(meta); return { name: meta.name, description: schema.function.description, parameters: schema.function.parameters, directSchema: schema, callVia: TOOL_CALL_NAME, source: meta.source || "generated-fallback", raw: meta.raw || null, note: `Prefer direct ${meta.name} when exposed; otherwise call ${TOOL_CALL_NAME} with {"name":"${meta.name}","arguments":{...}}.` }; }
export function normalizeActionCatalog(input = []) { return uniqueByName(extractCatalogItems(input).map(normalizeActionMeta).filter(item => item.name)); }
export function normalizeActionMeta(action = "") {
  if (typeof action === "string") return { name: action, description: toolDescription(action), parameters: genericActionParameters(action), source: "name-fallback" };
  const fn = action?.function || action?.tool || action?.metadata || action;
  const name = String(fn?.name || fn?.action || fn?.id || action?.name || action?.action || action?.id || "").trim();
  return { name, description: String(fn?.description || action?.description || toolDescription(name)), parameters: normalizeParameters(fn?.parameters || fn?.schema || fn?.input_schema || fn?.inputSchema || action?.parameters || action?.schema || action?.inputSchema || action?.input_schema || genericActionParameters(name)), source: action?.source || detectSource(action), raw: safeRaw(action) };
}

export const DEFAULT_SAFE_ACTIONS = Object.freeze(["list", "tree", "read", "readLines", "readManyLines", "read64", "bulk", "rg", "grep", "find", "selectString", "bulkSearch", "fileHashes", "connectedFiles", "aiContextPack", "simulateRuntime", "nodeCheckFiles", "nodeCheckFile", "command", "write", "bulkWrite", "mkdirp", "stat", "textStats"]);

function essentialActionMetas(essential = [], catalog = []) { const byName = new Map(catalog.map(item => [item.name, item])); return unique(essential).map(name => byName.get(name) || normalizeActionMeta(name)); }
function extractCatalogItems(input = []) { if (Array.isArray(input)) return input; if (!input || typeof input !== "object") return []; const buckets = [input.actions, input.tools, input.schemas, input.functions, input.catalog, input.manifest?.actions, input.manifest?.tools].filter(Boolean); if (buckets.length) return buckets.flatMap(extractCatalogItems); return Object.entries(input).map(([name, value]) => typeof value === "string" ? value : { name, ...(value || {}) }); }
function normalizeParameters(schema = {}) { if (!schema || typeof schema !== "object") return { type: "object", additionalProperties: true, properties: {} }; const clean = schema.type === "function" ? schema.function?.parameters : schema; if (clean?.type === "object") return { additionalProperties: true, ...clean, properties: clean.properties || {} }; if (clean?.properties) return { type: "object", additionalProperties: true, ...clean }; return { type: "object", additionalProperties: true, properties: objectToProperties(clean) }; }
function objectToProperties(value = {}) { return Object.fromEntries(Object.keys(value || {}).map(key => [key, inferProperty(value[key])])); }
function inferProperty(value) { if (value && typeof value === "object" && (value.type || value.properties || value.items)) return value; if (typeof value === "number") return { type: "number" }; if (typeof value === "boolean") return { type: "boolean" }; if (Array.isArray(value)) return { type: "array", items: {} }; return { type: "string" }; }
function genericActionParameters(name = "") { return { type: "object", additionalProperties: true, properties: { action: { type: "string", description: "Optional action override; usually omit." }, path: { type: "string", description: "Repo-relative file/path. Prefer this over absolute /data or C:\\ paths." }, p: { type: "string", description: "Short repo-relative path alias for actions that use p." }, paths: { type: "string", description: "Newline-separated repo-relative paths for bulk reads/checks." }, files: { type: "string", description: "Newline-separated file list for bulk actions." }, cwd: { type: "string", description: "Repo-relative working directory for command/test actions." }, query: { type: "string", description: "Search text or grep query." }, content: { type: "string", description: "Complete full file content for write-like actions." }, command: { type: "string", description: "Shell command for command action." }, maxChars: { type: "integer", description: "Read cap; increase only for targeted files." }, totalMaxChars: { type: "integer", description: "Bulk read cap." }, timeoutMs: { type: "integer", description: "Timeout for slow mobile relay calls." }, names: { type: "array", items: { type: "string" }, description: "Tool names for catalog/detail calls." } }, required: requiredFor(name) }; }
function toolDescription(name = "") { const base = `Run Awtsmoos tunnel action: ${name}. Use repo-relative paths and chunk large reads.`; if (/read|list|tree|bulk/.test(name)) return `${base} If a mobile relay aborts, retry with smaller maxChars or readLines/read64.`; if (/write/.test(name)) return `${base} Send the complete target file content only, never a partial patch.`; if (/simulateRuntime/.test(name)) return `${base} Use this to validate runtime behavior without needing Chrome when available.`; return base; }
function requiredFor(name = "") { if (name === "write") return ["path", "content"]; if (name === "command") return ["command"]; return []; }
function detectSource(action = {}) { if (action?.function?.parameters) return "openai-tool"; if (action?.parameters || action?.schema || action?.inputSchema || action?.input_schema) return "dynamic-schema"; return "generated-fallback"; }
function unique(values = []) { return [...new Set(values.filter(Boolean).map(String))]; }
function uniqueByName(values = []) { const map = new Map(); values.forEach(item => { if (!item?.name) return; const old = map.get(item.name); map.set(item.name, richer(old, item)); }); return [...map.values()]; }
function richer(oldItem, nextItem) { if (!oldItem) return nextItem; return score(nextItem) >= score(oldItem) ? { ...oldItem, ...nextItem } : { ...nextItem, ...oldItem }; }
function score(item = {}) { const sourceScore = item.source === "name-fallback" ? 0 : item.source === "generated-fallback" ? 1 : 100; return sourceScore + Number(Boolean(item.raw)) * 5 + Number(Boolean(item.description && !item.description.startsWith("Run Awtsmoos tunnel action"))) * 10 + Number(Boolean(item.parameters?.required?.length)) * 4 + Object.keys(item.parameters?.properties || {}).length; }
function compactNames(names = []) { const u = unique(names); return `${u.slice(0, 90).join(", ")}${u.length > 90 ? ` … plus ${u.length - 90} more` : ""}`; }
function safeRaw(action) { try { return JSON.parse(JSON.stringify(action)); } catch { return null; } }
