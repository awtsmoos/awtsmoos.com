// B"H
const TOOL_DETAIL_NAME = "awtsmoos_tool_details";
const TOOL_CALL_NAME = "awtsmoos_tool_call";

/**
 * B"H
 * Chapter 228: The Manifest Became A Compass, Not A Fog.
 *
 * The Awtsmoos tunnel tools now tell models exactly how to address files: use
 * repo-relative paths first, chunk reads, set timeouts, and route rare actions
 * through the catalog gate instead of hallucinating broken absolute homes.
 */
export function makeAwtsmoosToolSchema(name) {
  return { type: "function", function: { name, description: toolDescription(name), parameters: genericActionParameters(name) } };
}

export function makeToolSchemas(actions = []) { return unique(actions).map(makeAwtsmoosToolSchema); }

export function makeBridgeToolSchemas(essential = [], allActions = []) {
  const names = unique(allActions.length ? allActions : essential);
  const visible = unique(essential).filter(name => names.includes(name));
  return [...makeToolSchemas(visible), makeToolDetailsSchema(names), makeToolCallSchema(names)];
}

export function makeToolDetailsSchema(names = []) {
  return { type: "function", function: { name: TOOL_DETAIL_NAME, description: `Search/get details for Awtsmoos tunnel tools. Catalog sample: ${compactNames(names)}.`, parameters: { type: "object", additionalProperties: false, properties: { names: { type: "array", items: { type: "string" } }, query: { type: "string" } } } } };
}

export function makeToolCallSchema(names = []) {
  return { type: "function", function: { name: TOOL_CALL_NAME, description: `Run any Awtsmoos tunnel tool by exact name. Use repo-relative paths such as geelooy/games/app/index.html; avoid invented /data paths. Catalog sample: ${compactNames(names)}.`, parameters: { type: "object", additionalProperties: false, required: ["name", "arguments"], properties: { name: { type: "string" }, arguments: { type: "object", additionalProperties: true } } } } };
}

export function isCatalogToolName(name = "") { return name === TOOL_DETAIL_NAME || name === TOOL_CALL_NAME; }
export function toolDetailName() { return TOOL_DETAIL_NAME; }
export function toolCallName() { return TOOL_CALL_NAME; }

export function describeTool(name = "") {
  return { name, directSchema: makeAwtsmoosToolSchema(name), callVia: TOOL_CALL_NAME, commonArguments: Object.keys(genericActionParameters(name).properties), note: `Prefer direct ${name} when exposed; otherwise call ${TOOL_CALL_NAME} with {"name":"${name}","arguments":{...}}.` };
}

export const DEFAULT_SAFE_ACTIONS = Object.freeze([
  "list", "tree", "read", "readLines", "readManyLines", "read64", "bulk", "rg",
  "grep", "find", "selectString", "bulkSearch", "fileHashes", "connectedFiles",
  "aiContextPack", "simulateRuntime", "nodeCheckFiles", "nodeCheckFile", "command",
  "write", "bulkWrite", "mkdirp", "stat", "textStats"
]);

function genericActionParameters(name = "") {
  return { type: "object", additionalProperties: true, properties: {
    action: { type: "string", description: "Optional action override; usually omit." },
    path: { type: "string", description: "Repo-relative file/path. Prefer this over absolute /data or C:\\ paths." },
    p: { type: "string", description: "Short repo-relative path alias for actions that use p." },
    paths: { type: "string", description: "Newline-separated repo-relative paths for bulk reads/checks." },
    cwd: { type: "string", description: "Repo-relative working directory for command/test actions." },
    query: { type: "string", description: "Search text or grep query." },
    content: { type: "string", description: "Complete full file content for write-like actions." },
    command: { type: "string", description: "Shell command for command action." },
    maxChars: { type: "integer", description: "Read cap; increase only for targeted files." },
    totalMaxChars: { type: "integer", description: "Bulk read cap." },
    timeoutMs: { type: "integer", description: "Timeout for slow mobile relay calls." },
    names: { type: "array", items: { type: "string" }, description: "Tool names for catalog/detail calls." }
  }, required: requiredFor(name) };
}

function toolDescription(name = "") {
  const base = `Run Awtsmoos tunnel action: ${name}. Use repo-relative paths and chunk large reads.`;
  if (/read|list|tree|bulk/.test(name)) return `${base} If a mobile relay aborts, retry with smaller maxChars or readLines/read64.`;
  if (/write/.test(name)) return `${base} Send the complete target file content only, never a partial patch.`;
  return base;
}
function requiredFor(name = "") { if (name === "write") return ["path", "content"]; if (name === "command") return ["command"]; return []; }
function unique(values = []) { return [...new Set(values.filter(Boolean).map(String))]; }
function compactNames(names = []) { const u = unique(names); return `${u.slice(0, 90).join(", ")}${u.length > 90 ? ` … plus ${u.length - 90} more` : ""}`; }
