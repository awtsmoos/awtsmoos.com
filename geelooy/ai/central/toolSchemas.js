// B"H
import { ALL_TUNNEL_ACTIONS, AI_AGENT_ACTIONS } from "./actionCatalog.js";
import { makeNextStepToolSchema } from "./nextStepTool.js";

const TOOL_DETAIL_NAME = "awtsmoos_tool_details";
const TOOL_CALL_NAME = "awtsmoos_tool_call";

/**
 * B"H
 * Chapter 391: The Agent Saw Every Gate But Held No Crown-Key.
 *
 * Dynamic discovery is a map, not permission. The full generated tunnel action
 * list feeds details and generic calls, while only a compact safe subset becomes
 * direct tools. Ultimate power still lives in the tunnel/Virtual OS dispatcher,
 * where OAuth, scopes, root guards, dry-run defaults, and host-only reports bind
 * the sparks before they can become deeds.
 */
export const DEFAULT_SAFE_ACTIONS = Object.freeze(unique([
  "list", "tree", "read", "readLines", "readManyLines", "read64", "bulk",
  "rg", "grep", "find", "findFiles", "selectString", "bulkSearch",
  "fileHashes", "connectedFiles", "aiContextPack", "simulateRuntime",
  "nodeCheckFiles", "nodeCheckFile", "nodeCheckMany", "stat", "textStats",
  "jsonValidate", "yamlValidate", "write", "bulkWrite", "mkdirp",
  ...AI_AGENT_ACTIONS
]).filter(action => ALL_TUNNEL_ACTIONS.includes(action)));

export function makeAwtsmoosToolSchema(action) {
  const meta = normalizeActionMeta(action);
  return { type: "function", function: { name: meta.name, description: meta.description || toolDescription(meta.name), parameters: normalizeParameters(meta.parameters || meta.schema || meta.inputSchema || genericActionParameters(meta.name)) } };
}
export function makeToolSchemas(actions = DEFAULT_SAFE_ACTIONS) { return uniqueByName(actions.map(normalizeActionMeta)).map(makeAwtsmoosToolSchema); }
export function makeBridgeToolSchemas(essential = DEFAULT_SAFE_ACTIONS, allActions = ALL_TUNNEL_ACTIONS) {
  const catalog = normalizeActionCatalog(allActions.length ? allActions : ALL_TUNNEL_ACTIONS);
  const visible = essentialActionMetas(essential.length ? essential : DEFAULT_SAFE_ACTIONS, catalog);
  return [...makeToolSchemas(visible), makeNextStepToolSchema(), makeToolDetailsSchema(catalog), makeToolCallSchema(catalog)];
}
export function makeToolDetailsSchema(actions = ALL_TUNNEL_ACTIONS) { const catalog = normalizeActionCatalog(actions); return { type: "function", function: { name: TOOL_DETAIL_NAME, description: `Search/get full dynamic JSON schema details for Awtsmoos tunnel tools. Catalog has ${catalog.length} actions.`, parameters: { type: "object", additionalProperties: false, properties: { names: { type: "array", items: { type: "string" }, description: "Exact tool/action names to describe." }, query: { type: "string", description: "Search text to find matching tool names/descriptions." } } } } }; }
export function makeToolCallSchema(actions = ALL_TUNNEL_ACTIONS) { const catalog = normalizeActionCatalog(actions); return { type: "function", function: { name: TOOL_CALL_NAME, description: `Run any Awtsmoos tunnel tool by exact name through the final guarded dispatcher. Catalog has ${catalog.length} actions. Discovery does not bypass permissions.`, parameters: { type: "object", additionalProperties: false, required: ["name", "arguments"], properties: { name: { type: "string", description: "Exact Awtsmoos action/tool name." }, arguments: { type: "object", additionalProperties: true, description: "Arguments matching that tool's dynamic JSON schema. The dispatcher still enforces auth, scopes, root guards, and host-only restrictions." } } } } }; }
export function isCatalogToolName(name = "") { return name === TOOL_DETAIL_NAME || name === TOOL_CALL_NAME; }
export function toolDetailName() { return TOOL_DETAIL_NAME; }
export function toolCallName() { return TOOL_CALL_NAME; }
export function describeTool(action = "") { const meta = normalizeActionMeta(action); const schema = makeAwtsmoosToolSchema(meta); return { name: meta.name, description: schema.function.description, parameters: schema.function.parameters, directSchema: schema, callVia: TOOL_CALL_NAME, source: meta.source || "generated-fallback", raw: meta.raw || null, safety: "Final execution is gated by tunnel/Virtual OS auth, scopes, root guards, dry-run defaults, and host-only classification.", note: `Prefer direct ${meta.name} when exposed; otherwise call ${TOOL_CALL_NAME} with {"name":"${meta.name}","arguments":{...}}.` }; }
export function normalizeActionCatalog(input = ALL_TUNNEL_ACTIONS) { return uniqueByName(extractCatalogItems(input).map(normalizeActionMeta).filter(item => item.name)); }
export function normalizeActionMeta(action = "") {
  if (typeof action === "string") return { name: action, description: toolDescription(action), parameters: genericActionParameters(action), source: "generated-actions" };
  const fn = action?.function || action?.tool || action?.metadata || action;
  const name = String(fn?.name || fn?.action || fn?.id || action?.name || action?.action || action?.id || "").trim();
  return { name, description: String(fn?.description || action?.description || toolDescription(name)), parameters: normalizeParameters(fn?.parameters || fn?.schema || fn?.input_schema || fn?.inputSchema || action?.parameters || action?.schema || action?.inputSchema || action?.input_schema || genericActionParameters(name)), source: action?.source || detectSource(action), raw: safeRaw(action) };
}
function essentialActionMetas(essential = [], catalog = []) { const byName = new Map(catalog.map(item => [item.name, item])); return unique(essential).map(name => byName.get(name) || normalizeActionMeta(name)); }
function extractCatalogItems(input = []) { if (Array.isArray(input)) return input; if (!input || typeof input !== "object") return []; const buckets = [input.actions, input.tools, input.schemas, input.functions, input.catalog, input.manifest?.actions, input.manifest?.tools].filter(Boolean); if (buckets.length) return buckets.flatMap(extractCatalogItems); return Object.entries(input).map(([name, value]) => typeof value === "string" ? value : { name, ...(value || {}) }); }
function normalizeParameters(schema = {}) { if (!schema || typeof schema !== "object") return { type: "object", additionalProperties: true, properties: {} }; const clean = schema.type === "function" ? schema.function?.parameters : schema; if (clean?.type === "object") return { additionalProperties: true, ...clean, properties: clean.properties || {} }; if (clean?.properties) return { type: "object", additionalProperties: true, ...clean }; return { type: "object", additionalProperties: true, properties: objectToProperties(clean) }; }
function objectToProperties(value = {}) { return Object.fromEntries(Object.keys(value || {}).map(key => [key, inferProperty(value[key])])); }
function inferProperty(value) { if (value && typeof value === "object" && (value.type || value.properties || value.items)) return value; if (typeof value === "number") return { type: "number" }; if (typeof value === "boolean") return { type: "boolean" }; if (Array.isArray(value)) return { type: "array", items: {} }; return { type: "string" }; }
function genericActionParameters(name = "") { return isAiAgentAction(name) ? aiAgentParameters(name) : baseParameters(name); }
function baseParameters(name = "") { return { type: "object", additionalProperties: true, properties: { action: { type: "string", description: "Optional action override; usually omit." }, path: { type: "string", description: "Repo-relative or Virtual OS path." }, p: { type: "string", description: "Short path alias." }, tunnelName: { type: "string", description: "Connected tunnel or awtsmoos-virtual-os." }, targetVessel: { type: "string", description: "Use virtual-os for hosted Virtual OS." }, query: { type: "string" }, content: { type: "string", description: "Complete full file content for write-like actions." }, command: { type: "string", description: "Host command. Final dispatcher may reject or classify host-only." }, maxChars: { type: "integer" }, limit: { type: "integer" }, dryRun: { type: "boolean" }, confirm: { type: "boolean" } }, required: requiredFor(name) }; }
function aiAgentParameters(name = "") { return { type: "object", additionalProperties: true, properties: { provider: { type: "string", enum: ["minimax", "openrouter", "groq"] }, agentId: { type: "string" }, model: { type: "string" }, apiKey: { type: "string", description: "Provider API key for set-provider-key only; never echo secrets." }, message: { type: "string" }, prompt: { type: "string" }, system: { type: "string" }, taskId: { type: "string" }, title: { type: "string" }, outputDir: { type: "string" }, fileName: { type: "string" }, maxDepth: { type: "integer" }, maxChildrenPerTask: { type: "integer" }, maxTotalTasks: { type: "integer" }, allowRecursiveSpawn: { type: "boolean" }, stream: { type: "boolean" } }, required: requiredFor(name) }; }
function isAiAgentAction(name = "") { return AI_AGENT_ACTIONS.includes(String(name)); }
function toolDescription(name = "") { const base = `Awtsmoos tunnel action: ${name}. Dynamic discovery does not bypass execution permissions.`; if (isAiAgentAction(name)) return `${base} AI-agent action with provider/model/task parameters.`; if (/write|delete|move|copy|command|process|server|port|git|chrome|browser/i.test(name)) return `${base} Potentially sensitive; final dispatcher enforces scopes, dry-run/confirm, or host-only safe reporting.`; return base; }
function requiredFor(name = "") { if (name === "write") return ["path", "content"]; if (name === "aiAgentSetProviderKey") return ["provider", "apiKey"]; if (name === "aiAgentMessage") return ["message"]; if (name === "aiAgentSpawnTask" || name === "aiAgentSpawnNovel") return ["prompt"]; if (name === "aiAgentTaskStatus" || name === "aiAgentTaskResult") return ["taskId"]; return []; }
function detectSource(action = {}) { if (action?.function?.parameters) return "openai-tool"; if (action?.parameters || action?.schema || action?.inputSchema || action?.input_schema) return "dynamic-schema"; return "generated-fallback"; }
function unique(values = []) { return [...new Set(values.filter(Boolean).map(String))]; }
function uniqueByName(values = []) { const map = new Map(); values.forEach(item => { if (!item?.name) return; const old = map.get(item.name); map.set(item.name, richer(old, item)); }); return [...map.values()]; }
function richer(oldItem, nextItem) { if (!oldItem) return nextItem; return score(nextItem) >= score(oldItem) ? { ...oldItem, ...nextItem } : { ...nextItem, ...oldItem }; }
function score(item = {}) { return Number(Boolean(item.raw)) * 5 + Number(Boolean(item.description)) * 3 + Number(Boolean(item.parameters?.required?.length)) * 4 + Object.keys(item.parameters?.properties || {}).length; }
function safeRaw(action) { try { return JSON.parse(JSON.stringify(action)); } catch { return null; } }
